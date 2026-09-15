import fs from 'node:fs'

const origins = {
  'app-a': 'https://app-a.keycloak.test:30081',
  'app-b': 'https://app-b.keycloak.test:30082',
}
const keycloakOrigin = 'https://keycloak.keycloak.test:30080'
const apiOrigin = 'http://api:3000'

function assert(condition, message) { if (!condition) throw new Error(message) }
function secret(name) {
  const value = fs.readFileSync(`/run/secrets/${name}`, 'utf8').trimEnd()
  assert(value, `required verification secret is empty: ${name}`)
  return value
}
function storeCookies(response, jar) {
  for (const cookie of response.headers.getSetCookie()) {
    const pair = cookie.split(';', 1)[0]
    const separator = pair.indexOf('=')
    if (separator > 0) jar.set(pair.slice(0, separator), pair.slice(separator + 1))
  }
}
function cookieHeader(jar) { return [...jar].map(([name, value]) => `${name}=${value}`).join('; ') }
async function request(url, jar = new Map(), options = {}) {
  const headers = new Headers(options.headers)
  if (cookieHeader(jar)) headers.set('cookie', cookieHeader(jar))
  const response = await fetch(url, {
    ...options, headers, redirect: 'manual', signal: AbortSignal.timeout(10_000),
  })
  storeCookies(response, jar)
  return response
}
function loginAction(html) {
  const form = (html.match(/<form\b[^>]*>/gi) ?? []).find((item) => /\bid=["']kc-form-login["']/i.test(item))
  const action = form?.match(/\baction=["']([^"']+)["']/i)?.[1]
  assert(action, 'Keycloak login form action was not found')
  return action.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'")
}
async function begin(app, appCookies, keycloakCookies) {
  const response = await request(`${origins[app]}/login`, appCookies)
  assert(response.status === 302, `${app} did not redirect to Keycloak`)
  const url = new URL(response.headers.get('location'))
  assert(url.origin === keycloakOrigin, `${app} authorization origin is wrong`)
  assert(url.searchParams.get('redirect_uri') === `${origins[app]}/callback`, `${app} redirect URI is wrong`)
  assert(url.searchParams.get('response_type') === 'code', `${app} response type is not code`)
  assert(url.searchParams.get('code_challenge_method') === 'S256', `${app} PKCE is not S256`)
  assert(url.searchParams.has('state') && url.searchParams.has('nonce'), `${app} state or nonce is missing`)
  return request(url, keycloakCookies)
}
async function callback(app, appCookies, location) {
  assert(location && new URL(location).origin === origins[app], `${app} callback origin is wrong`)
  const response = await request(location, appCookies)
  assert(response.status === 302, `${app} callback did not complete`)
  const session = await request(`${origins[app]}/session`, appCookies)
  assert(session.ok, `${app} session endpoint failed`)
  return session.json()
}
async function login(app, username, password, keycloakCookies = new Map()) {
  const appCookies = new Map()
  const authorization = await begin(app, appCookies, keycloakCookies)
  assert(authorization.status === 200,
    `${username} login expected Keycloak form HTTP 200; observed HTTP ${authorization.status}`)
  const response = await request(loginAction(await authorization.text()), keycloakCookies, {
    method: 'POST', body: new URLSearchParams({ username, password, credentialId: '' }),
  })
  assert(response.status === 302, `${username} credentials were not accepted`)
  const session = await callback(app, appCookies, response.headers.get('location'))
  assert(session.authenticated && session.username === username, `${username} app session is wrong`)
  return { appCookies, keycloakCookies }
}
async function wrongPassword(username) {
  const appCookies = new Map(); const keycloakCookies = new Map()
  const authorization = await begin('app-a', appCookies, keycloakCookies)
  assert(authorization.status === 200, `${username} wrong-password check has no login form`)
  const response = await request(loginAction(await authorization.text()), keycloakCookies, {
    method: 'POST', body: new URLSearchParams({ username, password: 'intentionally-wrong-password', credentialId: '' }),
  })
  assert(response.status === 200, `${username} wrong password was not rejected`)
}
async function apiResults(flow) {
  const claimsResponse = await request(`${origins['app-a']}/api/claims`, flow.appCookies)
  assert(claimsResponse.status === 200, `claims endpoint returned ${claimsResponse.status}`)
  const claims = await claimsResponse.json()
  assert(JSON.stringify(Object.keys(claims).sort()) === JSON.stringify(['aud', 'exp', 'groups', 'iss', 'realm_access']),
    `claims response fields are not the allowed set: ${Object.keys(claims).sort().join(',')}`)
  assert(JSON.stringify(Object.keys(claims.realm_access).sort()) === JSON.stringify(['roles']),
    `realm_access fields are not the allowed set: ${Object.keys(claims.realm_access).sort().join(',')}`)
  assert(claims.iss === `${keycloakOrigin}/realms/study`, `claims issuer is ${claims.iss}`)
  assert((Array.isArray(claims.aud) ? claims.aud : [claims.aud]).includes('lab-api'), 'claims audience lacks lab-api')
  return {
    claims,
    user: await request(`${origins['app-a']}/api/user`, flow.appCookies),
    admin: await request(`${origins['app-a']}/api/admin`, flow.appCookies),
  }
}

const step = process.argv[2]
if (!['app-a', 'sso', 'api', 'ldap', 'groups'].includes(step)) {
  console.error('usage: node guided.mjs app-a|sso|api|ldap|groups'); process.exit(2)
}
if (step === 'app-a') {
  await login('app-a', 'local-user', secret('keycloak_local_user_password'))
  await wrongPassword('local-user')
  console.log('app-a=authorization-code,pkce-s256,login-passed;wrong-password=rejected')
} else if (step === 'sso') {
  const flow = await login('app-a', 'local-user', secret('keycloak_local_user_password'))
  const appBCookies = new Map()
  const authorization = await begin('app-b', appBCookies, flow.keycloakCookies)
  assert(authorization.status === 302, 'app-b did not reuse the Keycloak SSO session')
  const session = await callback('app-b', appBCookies, authorization.headers.get('location'))
  assert(session.username === 'local-user', 'app-b SSO identity is wrong')
  console.log('sso=app-a-credentials-once,app-b-without-credentials')
} else if (step === 'api') {
  const noToken = await request(`${apiOrigin}/user`)
  assert(noToken.status === 401, `API without token returned ${noToken.status}`)
  const results = await apiResults(await login('app-a', 'local-user', secret('keycloak_local_user_password')))
  assert(results.user.status === 200 && results.admin.status === 403,
    `local-user API expected user=200/admin=403; observed ${results.user.status}/${results.admin.status}`)
  assert(results.claims.realm_access.roles.includes('app-user'), 'local-user token lacks app-user')
  console.log('api=no-token:401,local-user:user-200/admin-403,claims-validated')
} else if (step === 'ldap') {
  for (const [username, filename] of [['alice', 'samba_alice_password'], ['bob', 'samba_bob_password']]) {
    await login('app-a', username, secret(filename)); await wrongPassword(username)
  }
  console.log('ldap=alice,bob-login-passed;wrong-passwords=rejected')
} else {
  for (const [username, filename, expectedAdmin, groups] of [
    ['alice', 'samba_alice_password', 200, ['/api-admins', '/app-users']],
    ['bob', 'samba_bob_password', 403, ['/app-users']],
  ]) {
    const results = await apiResults(await login('app-a', username, secret(filename)))
    assert(results.user.status === 200 && results.admin.status === expectedAdmin,
      `${username} API expected user=200/admin=${expectedAdmin}; observed ${results.user.status}/${results.admin.status}`)
    const observedGroups = [...results.claims.groups].sort()
    assert(JSON.stringify(observedGroups) === JSON.stringify(groups),
      `${username} groups expected ${JSON.stringify(groups)}; observed ${JSON.stringify(observedGroups)}`)
  }
  console.log('groups=alice:user-200/admin-200,bob:user-200/admin-403,claims-validated')
}
