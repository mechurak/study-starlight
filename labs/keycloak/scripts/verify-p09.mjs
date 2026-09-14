import fs from 'node:fs'

import { createRemoteJWKSet, jwtVerify } from 'jose'
import * as oidc from 'openid-client'

const scenario = process.env.P09_SCENARIO
const controlDirectory = '/tmp/p09-control'
const appOrigin = 'https://app-a.keycloak.test:30081'
const keycloakOrigin = 'https://keycloak.keycloak.test:30080'
const issuer = `${keycloakOrigin}/realms/study`
const tokenEndpoint = `${issuer}/protocol/openid-connect/token`
const apiOrigin = 'http://api:3000'
const clientId = 'p08-diagnostic'
const redirectUri = 'https://p08-diagnostic.keycloak.test/callback'
let diagnosticStage = 'startup'

function readSecret(filename) {
  const value = fs.readFileSync(filename, 'utf8').trimEnd()
  if (!value) throw new Error('required diagnostic secret is empty')
  return value
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function storeCookies(response, jar) {
  for (const cookie of response.headers.getSetCookie()) {
    const pair = cookie.split(';', 1)[0]
    const separator = pair.indexOf('=')
    if (separator > 0) jar.set(pair.slice(0, separator), pair.slice(separator + 1))
  }
}

function cookieHeader(jar) {
  return [...jar].map(([name, value]) => `${name}=${value}`).join('; ')
}

async function request(url, jar, options = {}) {
  const headers = new Headers(options.headers)
  const cookies = cookieHeader(jar)
  if (cookies) headers.set('cookie', cookies)
  const response = await fetch(url, {
    ...options,
    headers,
    redirect: 'manual',
    signal: AbortSignal.timeout(30_000),
  })
  storeCookies(response, jar)
  return response
}

function decodeHtmlAttribute(value) {
  return value.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'")
}

function loginAction(html) {
  const forms = html.match(/<form\b[^>]*>/gi) ?? []
  const loginForm = forms.find((form) => /\bid=["']kc-form-login["']/i.test(form))
  return loginForm?.match(/\baction=["']([^"']+)["']/i)?.[1]
}

const credentials = {
  alice: readSecret('/run/secrets/samba_alice_password'),
  bob: readSecret('/run/secrets/samba_bob_password'),
}

const metadataResponse = await fetch(`${issuer}/.well-known/openid-configuration`, {
  signal: AbortSignal.timeout(10_000),
})
assert(metadataResponse.ok, 'OIDC discovery failed')
const metadata = await metadataResponse.json()
assert(metadata.issuer === issuer, 'OIDC issuer changed')
assert(metadata.token_endpoint === tokenEndpoint, 'OIDC token endpoint changed')
const keySet = createRemoteJWKSet(new URL(metadata.jwks_uri))
const oidcConfiguration = await oidc.discovery(new URL(issuer), clientId)

async function beginCodeFlow(username) {
  const codeVerifier = oidc.randomPKCECodeVerifier()
  const state = oidc.randomState()
  const nonce = oidc.randomNonce()
  const authorizationUrl = oidc.buildAuthorizationUrl(oidcConfiguration, {
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid profile',
    code_challenge: await oidc.calculatePKCECodeChallenge(codeVerifier),
    code_challenge_method: 'S256',
    state,
    nonce,
    prompt: 'login',
  })
  const cookies = new Map()
  const authorizationResponse = await request(authorizationUrl, cookies)
  assert(authorizationResponse.status === 200, `${username} did not receive a login form`)
  const encodedAction = loginAction(await authorizationResponse.text())
  assert(encodedAction, `${username} login form action is missing`)
  const action = decodeHtmlAttribute(encodedAction)
  const credentialResponse = await request(action, cookies, {
    method: 'POST',
    body: new URLSearchParams({ username, password: credentials[username], credentialId: '' }),
  })
  const location = credentialResponse.headers.get('location')
  const accepted = credentialResponse.status === 302
    && location
    && new URL(location).origin === new URL(redirectUri).origin
  return {
    accepted,
    httpStatus: credentialResponse.status,
    callback: accepted ? location : undefined,
    codeVerifier,
    state,
    nonce,
  }
}

async function finishCodeFlow(started, username) {
  assert(started.accepted, `${username} code flow was not accepted`)
  const tokens = await oidc.authorizationCodeGrant(
    oidcConfiguration,
    new URL(started.callback),
    {
      pkceCodeVerifier: started.codeVerifier,
      expectedState: started.state,
      expectedNonce: started.nonce,
      idTokenExpected: true,
    },
  )
  assert(typeof tokens.access_token === 'string', `${username} access token is missing`)
  assert(typeof tokens.refresh_token === 'string', `${username} refresh token is missing`)
  return tokens
}

async function login(username) {
  return finishCodeFlow(await beginCodeFlow(username), username)
}

async function claims(accessToken) {
  const { payload } = await jwtVerify(accessToken, keySet, {
    algorithms: ['RS256'],
    issuer,
    audience: 'lab-api',
  })
  assert(typeof payload.exp === 'number', 'access token expiration is missing')
  return payload
}

function labClaims(payload) {
  const groups = Array.isArray(payload.groups) ? [...payload.groups].sort() : []
  const roles = Array.isArray(payload.realm_access?.roles)
    ? payload.realm_access.roles.filter((role) => ['app-user', 'api-admin'].includes(role)).sort()
    : []
  return { groups, roles }
}

async function apiStatuses(accessToken) {
  const headers = { authorization: `Bearer ${accessToken}` }
  const user = await fetch(`${apiOrigin}/user`, { headers, signal: AbortSignal.timeout(10_000) })
  const admin = await fetch(`${apiOrigin}/admin`, { headers, signal: AbortSignal.timeout(10_000) })
  return { user: user.status, admin: admin.status }
}

async function appSession() {
  const appCookies = new Map()
  const keycloakCookies = new Map()
  const loginResponse = await request(`${appOrigin}/login`, appCookies)
  assert(loginResponse.status === 302, 'app login did not redirect')
  const authorizationUrl = loginResponse.headers.get('location')
  assert(authorizationUrl && new URL(authorizationUrl).origin === keycloakOrigin, 'app authorization URL is wrong')
  const authorizationResponse = await request(authorizationUrl, keycloakCookies)
  assert(authorizationResponse.status === 200, 'app login form was not returned')
  const encodedAction = loginAction(await authorizationResponse.text())
  assert(encodedAction, 'app login form action is missing')
  const credentialResponse = await request(decodeHtmlAttribute(encodedAction), keycloakCookies, {
    method: 'POST',
    body: new URLSearchParams({ username: 'alice', password: credentials.alice, credentialId: '' }),
  })
  const callback = credentialResponse.headers.get('location')
  assert(credentialResponse.status === 302 && callback, 'app credentials were not accepted')
  const callbackResponse = await request(callback, appCookies)
  assert(callbackResponse.status === 302, 'app callback did not complete')
  return appCookies
}

async function inspectAppSession(cookies) {
  const sessionResponse = await request(`${appOrigin}/session`, cookies)
  const session = await sessionResponse.json()
  const userResponse = await request(`${appOrigin}/api/user`, cookies)
  const adminResponse = await request(`${appOrigin}/api/admin`, cookies)
  return {
    authenticated: sessionResponse.ok && session.authenticated === true && session.username === 'alice',
    user: userResponse.status,
    admin: adminResponse.status,
  }
}

async function refresh(refreshToken) {
  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      refresh_token: refreshToken,
    }),
    signal: AbortSignal.timeout(30_000),
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    return { ok: false, status: response.status, error: body.error ?? 'unknown' }
  }
  const body = await response.json()
  assert(typeof body.access_token === 'string', 'refresh response has no access token')
  return { ok: true, status: response.status, accessToken: body.access_token }
}

async function waitForSignal(filename, timeoutMilliseconds) {
  const started = performance.now()
  while (!fs.existsSync(`${controlDirectory}/${filename}`)) {
    assert(performance.now() - started < timeoutMilliseconds, `timed out waiting for ${filename}`)
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  return Math.round(performance.now() - started)
}

function safeResult(name, value) {
  console.log(`${name}=${value}`)
}

async function main() {
  assert(['group-change', 'account-disabled', 'ldap-outage'].includes(scenario), 'invalid P09 scenario')
  fs.mkdirSync(controlDirectory, { mode: 0o700 })
  diagnosticStage = 'baseline-code-login'
  const existingTokens = await login('alice')
  const laterRefreshTokens = await login('alice')
  diagnosticStage = 'baseline-token-validation'
  const existingClaims = await claims(existingTokens.access_token)
  const existingApi = await apiStatuses(existingTokens.access_token)
  diagnosticStage = 'baseline-app-login'
  const appCookies = await appSession()
  diagnosticStage = 'baseline-app-inspection'
  const appBefore = await inspectAppSession(appCookies)
  assert(existingApi.user === 200 && existingApi.admin === 200, 'existing alice token is not baseline admin')
  assert(appBefore.authenticated && appBefore.user === 200 && appBefore.admin === 200, 'app session is not baseline admin')

  diagnosticStage = 'ready-signal'
  fs.writeFileSync(`${controlDirectory}/ready`, 'ready\n', { mode: 0o600 })
  diagnosticStage = 'change-signal-wait'
  const conditionWaitMilliseconds = await waitForSignal('change-applied', 120_000)
  const observationStarted = performance.now()

  diagnosticStage = 'existing-token-observation'
  const existingAfter = await apiStatuses(existingTokens.access_token)
  diagnosticStage = 'refresh-observation'
  const refreshed = await refresh(existingTokens.refresh_token)
  diagnosticStage = 'new-login-observation'
  const newLogin = await beginCodeFlow('alice')
  diagnosticStage = 'post-login-refresh-observation'
  const refreshedAfterNewLogin = await refresh(laterRefreshTokens.refresh_token)
  let refreshedClaims
  let refreshedApi
  let refreshedAfterNewLoginClaims
  let refreshedAfterNewLoginApi
  let newClaims
  let newApi
  if (refreshed.ok) {
    diagnosticStage = 'refreshed-token-validation'
    refreshedClaims = labClaims(await claims(refreshed.accessToken))
    refreshedApi = await apiStatuses(refreshed.accessToken)
  }
  if (refreshedAfterNewLogin.ok) {
    diagnosticStage = 'post-login-refreshed-token-validation'
    refreshedAfterNewLoginClaims = labClaims(await claims(refreshedAfterNewLogin.accessToken))
    refreshedAfterNewLoginApi = await apiStatuses(refreshedAfterNewLogin.accessToken)
  }
  if (newLogin.accepted) {
    diagnosticStage = 'new-token-validation'
    const newTokens = await finishCodeFlow(newLogin, 'alice')
    newClaims = labClaims(await claims(newTokens.access_token))
    newApi = await apiStatuses(newTokens.access_token)
  }
  diagnosticStage = 'app-session-observation'
  const appAfter = await inspectAppSession(appCookies)

  diagnosticStage = 'scenario-assertions'
  if (scenario === 'group-change') {
    assert(refreshed.ok, 'group change refresh was rejected')
    assert(refreshedAfterNewLogin.ok, 'group change post-login refresh was rejected')
    assert(newLogin.accepted, 'group change new login was rejected')
    for (const [label, currentClaims, currentApi] of [
      ['refresh', refreshedClaims, refreshedApi],
      ['post-login refresh', refreshedAfterNewLoginClaims, refreshedAfterNewLoginApi],
      ['new login', newClaims, newApi],
    ]) {
      assert(JSON.stringify(currentClaims.groups) === JSON.stringify(['/app-users']), `${label} groups did not update`)
      assert(JSON.stringify(currentClaims.roles) === JSON.stringify(['app-user']), `${label} roles did not update`)
      assert(currentApi.user === 200 && currentApi.admin === 403, `${label} API result did not update`)
    }
    const bobTokens = await login('bob')
    const bobClaims = labClaims(await claims(bobTokens.access_token))
    const bobApi = await apiStatuses(bobTokens.access_token)
    assert(JSON.stringify(bobClaims.groups) === JSON.stringify(['/app-users']), 'bob groups changed')
    assert(JSON.stringify(bobClaims.roles) === JSON.stringify(['app-user']), 'bob roles changed')
    assert(bobApi.user === 200 && bobApi.admin === 403, 'bob API result changed')
    safeResult('bob_new_token_groups', '/app-users')
    safeResult('bob_new_token_roles', 'app-user')
    safeResult('bob_new_token_api', 'user:200,admin:403')
  } else if (scenario === 'account-disabled') {
    assert(!refreshed.ok && refreshed.status === 400 && refreshed.error === 'invalid_grant', 'disabled account refresh was not invalid_grant')
    assert(!refreshedAfterNewLogin.ok && refreshedAfterNewLogin.status === 400 && refreshedAfterNewLogin.error === 'invalid_grant', 'disabled account post-login refresh was not invalid_grant')
    assert(!newLogin.accepted, 'disabled account new login succeeded')
  } else {
    assert(refreshed.ok, 'LDAP outage refresh was rejected in the pinned DEFAULT-cache setup')
    assert(refreshedAfterNewLogin.ok, 'LDAP outage refresh after failed login was rejected in the pinned DEFAULT-cache setup')
    assert(!newLogin.accepted, 'LDAP outage new login succeeded')
    assert(JSON.stringify(refreshedClaims.groups) === JSON.stringify(['/api-admins', '/app-users']), 'outage refresh groups changed')
    assert(JSON.stringify(refreshedClaims.roles) === JSON.stringify(['api-admin', 'app-user']), 'outage refresh roles changed')
    assert(refreshedApi.user === 200 && refreshedApi.admin === 200, 'outage refresh API result changed')
    assert(JSON.stringify(refreshedAfterNewLoginClaims.groups) === JSON.stringify(['/api-admins', '/app-users']), 'outage post-login refresh groups changed')
    assert(JSON.stringify(refreshedAfterNewLoginClaims.roles) === JSON.stringify(['api-admin', 'app-user']), 'outage post-login refresh roles changed')
    assert(refreshedAfterNewLoginApi.user === 200 && refreshedAfterNewLoginApi.admin === 200, 'outage post-login refresh API result changed')
  }

  assert(existingAfter.user === 200 && existingAfter.admin === 200, 'existing JWT stopped working before expiration')
  assert(appAfter.authenticated, 'application session disappeared')
  assert(appAfter.user === 200 && appAfter.admin === 200, 'application session existing token result changed')

  const secondsRemaining = existingClaims.exp - Math.floor(Date.now() / 1000)
  assert(secondsRemaining > 0, 'existing JWT expired during the scenario')
  safeResult('scenario', scenario)
  safeResult('condition_wait_ms', conditionWaitMilliseconds)
  safeResult('observation_elapsed_ms', Math.round(performance.now() - observationStarted))
  safeResult('existing_jwt_seconds_remaining', secondsRemaining)
  safeResult('existing_jwt_api', 'user:200,admin:200')
  safeResult('observation_order', 'existing_jwt,refresh_before_new_login,new_login,refresh_after_new_login,app_session')
  safeResult('refresh_before_new_login', refreshed.ok ? `accepted,http:${refreshed.status}` : `rejected,http:${refreshed.status},error:${refreshed.error}`)
  if (refreshed.ok) {
    safeResult('refresh_token_groups', refreshedClaims.groups.join(','))
    safeResult('refresh_token_roles', refreshedClaims.roles.join(','))
    safeResult('refresh_token_api', `user:${refreshedApi.user},admin:${refreshedApi.admin}`)
  }
  safeResult('new_login', newLogin.accepted ? `accepted,http:${newLogin.httpStatus}` : `rejected,http:${newLogin.httpStatus}`)
  if (newLogin.accepted) {
    safeResult('new_token_groups', newClaims.groups.join(','))
    safeResult('new_token_roles', newClaims.roles.join(','))
    safeResult('new_token_api', `user:${newApi.user},admin:${newApi.admin}`)
  }
  safeResult('refresh_after_new_login', refreshedAfterNewLogin.ok ? `accepted,http:${refreshedAfterNewLogin.status}` : `rejected,http:${refreshedAfterNewLogin.status},error:${refreshedAfterNewLogin.error}`)
  if (refreshedAfterNewLogin.ok) {
    safeResult('post_login_refresh_token_groups', refreshedAfterNewLoginClaims.groups.join(','))
    safeResult('post_login_refresh_token_roles', refreshedAfterNewLoginClaims.roles.join(','))
    safeResult('post_login_refresh_token_api', `user:${refreshedAfterNewLoginApi.user},admin:${refreshedAfterNewLoginApi.admin}`)
  }
  safeResult('app_session', 'authenticated:true')
  safeResult('app_session_existing_token_api', 'user:200,admin:200')
  safeResult('flow', 'authorization_code,pkce_s256,state,nonce,prompt_login')
  safeResult('tls_verification', 'web_ca')
}

main().catch((error) => {
  console.error(`P09 diagnostic failed at ${diagnosticStage}: ${error?.name ?? 'Error'}`)
  process.exitCode = 1
})
