import fs from 'node:fs'

import { createRemoteJWKSet, jwtVerify } from 'jose'
import * as oidc from 'openid-client'

const appOrigin = 'https://app-a.keycloak.test:30081'
const keycloakOrigin = 'https://keycloak.keycloak.test:30080'
const issuer = `${keycloakOrigin}/realms/study`
const apiOrigin = 'http://api:3000'
const diagnosticClientId = 'p08-diagnostic'
const diagnosticRedirectUri = 'https://p08-diagnostic.keycloak.test/callback'

function readSecret(filename) {
  const value = fs.readFileSync(filename, 'utf8').trimEnd()
  if (!value) {
    throw new Error(`required diagnostic secret is empty: ${filename}`)
  }
  return value
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

function storeCookies(response, jar) {
  for (const cookie of response.headers.getSetCookie()) {
    const pair = cookie.split(';', 1)[0]
    const separator = pair.indexOf('=')
    if (separator > 0) {
      jar.set(pair.slice(0, separator), pair.slice(separator + 1))
    }
  }
}

function cookieHeader(jar) {
  return [...jar].map(([name, value]) => `${name}=${value}`).join('; ')
}

async function request(url, jar, options = {}) {
  const headers = new Headers(options.headers)
  const cookies = cookieHeader(jar)
  if (cookies) {
    headers.set('cookie', cookies)
  }
  const response = await fetch(url, {
    ...options,
    headers,
    redirect: 'manual',
    signal: AbortSignal.timeout(10_000),
  })
  storeCookies(response, jar)
  return response
}

function decodeHtmlAttribute(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
}

function loginAction(html) {
  const forms = html.match(/<form\b[^>]*>/gi) ?? []
  const loginForm = forms.find((form) => /\bid=["']kc-form-login["']/i.test(form))
  const action = loginForm?.match(/\baction=["']([^"']+)["']/i)?.[1]
  if (!action) {
    throw new Error('Keycloak login form action was not found')
  }
  return decodeHtmlAttribute(action)
}

async function submitCredentials(authorizationUrl, username, password, keycloakCookies) {
  const authorizationResponse = await request(authorizationUrl, keycloakCookies)
  assert(authorizationResponse.status === 200, `${username} did not receive a login form`)
  const action = loginAction(await authorizationResponse.text())
  const credentialResponse = await request(action, keycloakCookies, {
    method: 'POST',
    body: new URLSearchParams({ username, password, credentialId: '' }),
  })
  assert(credentialResponse.status === 302, `${username} credentials were not accepted`)
  const callback = credentialResponse.headers.get('location')
  assert(callback, `${username} credential response has no callback`)
  return callback
}

const credentials = {
  alice: readSecret('/run/secrets/samba_alice_password'),
  bob: readSecret('/run/secrets/samba_bob_password'),
  'local-user': readSecret('/run/secrets/keycloak_local_user_password'),
}

async function loginThroughApp(username) {
  const appCookies = new Map()
  const keycloakCookies = new Map()
  const loginResponse = await request(`${appOrigin}/login`, appCookies)
  assert(loginResponse.status === 302, `${username} app login did not redirect`)
  const authorizationUrl = new URL(loginResponse.headers.get('location'))
  assert(authorizationUrl.origin === keycloakOrigin, `${username} authorization origin is not Keycloak`)
  assert(authorizationUrl.searchParams.get('response_type') === 'code', 'app flow is not code')
  assert(authorizationUrl.searchParams.get('code_challenge_method') === 'S256', 'app PKCE is not S256')
  assert(authorizationUrl.searchParams.has('state'), 'app state is missing')
  assert(authorizationUrl.searchParams.has('nonce'), 'app nonce is missing')

  const callback = await submitCredentials(
    authorizationUrl,
    username,
    credentials[username],
    keycloakCookies,
  )
  assert(new URL(callback).origin === appOrigin, `${username} app callback origin is wrong`)
  const callbackResponse = await request(callback, appCookies)
  assert(callbackResponse.status === 302, `${username} app callback did not complete`)

  const sessionResponse = await request(`${appOrigin}/session`, appCookies)
  assert(sessionResponse.ok, `${username} app session failed`)
  const session = await sessionResponse.json()
  assert(session.authenticated === true, `${username} app session is not authenticated`)
  assert(session.username === username, `${username} app session has the wrong identity`)

  const userResponse = await request(`${appOrigin}/api/user`, appCookies)
  assert(userResponse.status === 200, `${username} app-user API request was not allowed`)
  const adminResponse = await request(`${appOrigin}/api/admin`, appCookies)
  const expectedAdminStatus = username === 'alice' ? 200 : 403
  assert(
    adminResponse.status === expectedAdminStatus,
    `${username} admin API status was ${adminResponse.status}, expected ${expectedAdminStatus}`,
  )
  return { userStatus: userResponse.status, adminStatus: adminResponse.status }
}

const discoveryResponse = await fetch(`${issuer}/.well-known/openid-configuration`, {
  signal: AbortSignal.timeout(10_000),
})
assert(discoveryResponse.ok, 'OIDC discovery failed')
const metadata = await discoveryResponse.json()
assert(metadata.issuer === issuer, 'OIDC discovery issuer is wrong')
assert(typeof metadata.jwks_uri === 'string', 'OIDC discovery has no JWKS URI')
const jwksUrl = new URL(metadata.jwks_uri)
assert(jwksUrl.protocol === 'https:', 'JWKS URL is not HTTPS')
assert(jwksUrl.origin === keycloakOrigin, 'JWKS URL origin is wrong')
const keySet = createRemoteJWKSet(jwksUrl)
const oidcConfiguration = await oidc.discovery(new URL(issuer), diagnosticClientId)

async function tokenClaimsThroughCodeFlow(username) {
  const codeVerifier = oidc.randomPKCECodeVerifier()
  const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier)
  const state = oidc.randomState()
  const nonce = oidc.randomNonce()
  const authorizationUrl = oidc.buildAuthorizationUrl(oidcConfiguration, {
    redirect_uri: diagnosticRedirectUri,
    response_type: 'code',
    scope: 'openid profile',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state,
    nonce,
  })
  const callback = await submitCredentials(
    authorizationUrl,
    username,
    credentials[username],
    new Map(),
  )
  assert(new URL(callback).origin === new URL(diagnosticRedirectUri).origin, 'diagnostic callback origin is wrong')

  const tokens = await oidc.authorizationCodeGrant(
    oidcConfiguration,
    new URL(callback),
    {
      pkceCodeVerifier: codeVerifier,
      expectedState: state,
      expectedNonce: nonce,
      idTokenExpected: true,
    },
  )
  assert(typeof tokens.access_token === 'string', `${username} access token is missing`)
  const { payload } = await jwtVerify(tokens.access_token, keySet, {
    algorithms: ['RS256'],
    issuer,
    audience: 'lab-api',
  })
  assert(typeof payload.exp === 'number', `${username} token expiration is missing`)
  return payload
}

for (const [username, expectedGroups, expectedRoles] of [
  ['alice', ['/api-admins', '/app-users'], ['api-admin', 'app-user']],
  ['bob', ['/app-users'], ['app-user']],
]) {
  const claims = await tokenClaimsThroughCodeFlow(username)
  const groups = Array.isArray(claims.groups) ? [...claims.groups].sort() : []
  const roles = Array.isArray(claims.realm_access?.roles)
    ? claims.realm_access.roles.filter((role) => ['app-user', 'api-admin'].includes(role)).sort()
    : []
  assert(JSON.stringify(groups) === JSON.stringify(expectedGroups), `${username} groups claim is wrong`)
  assert(JSON.stringify(roles) === JSON.stringify(expectedRoles), `${username} realm roles claim is wrong`)
}

const aliceResult = await loginThroughApp('alice')
const bobResult = await loginThroughApp('bob')
const localResult = await loginThroughApp('local-user')

assert(aliceResult.userStatus === 200 && aliceResult.adminStatus === 200, 'alice API result is wrong')
assert(bobResult.userStatus === 200 && bobResult.adminStatus === 403, 'bob API result is wrong')
assert(localResult.userStatus === 200 && localResult.adminStatus === 403, 'local-user P07 result changed')

const noTokenResponse = await request(`${apiOrigin}/user`, new Map())
assert(noTokenResponse.status === 401, 'API request without a token was not 401')

console.log('samba_keycloak_login=alice,bob')
console.log('token_groups=alice(/app-users,/api-admins),bob(/app-users)')
console.log('token_realm_roles=alice(app-user,api-admin),bob(app-user)')
console.log('app_api_alice=user:200,admin:200')
console.log('app_api_bob=user:200,admin:403')
console.log('p07_local_user=user:200,admin:403')
console.log('api_without_token=401')
console.log('flow=authorization_code,pkce_s256,state,nonce')
console.log('tls_verification=web_ca')
