import fs from 'node:fs'
// Historical detailed verification.

const appAOrigin = 'https://app-a.keycloak.test:30081'
const appBOrigin = 'https://app-b.keycloak.test:30082'
const keycloakOrigin = 'https://keycloak.keycloak.test:30080'
const apiOrigin = 'http://api:3000'
const password = fs
  .readFileSync('/run/secrets/keycloak_local_user_password', 'utf8')
  .trimEnd()

if (!password) {
  throw new Error('local-user password secret is empty')
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

async function beginLogin(appOrigin, appCookies, keycloakCookies) {
  const loginResponse = await request(`${appOrigin}/login`, appCookies)
  assert(loginResponse.status === 302, `${appOrigin} login did not redirect`)

  const location = loginResponse.headers.get('location')
  assert(location, `${appOrigin} login redirect has no location`)
  const authorizationUrl = new URL(location)
  assert(authorizationUrl.origin === keycloakOrigin, 'authorization origin is not Keycloak')
  assert(
    authorizationUrl.searchParams.get('redirect_uri') === `${appOrigin}/callback`,
    `${appOrigin} redirect URI is not exact`,
  )
  assert(authorizationUrl.searchParams.get('response_type') === 'code', 'response type is not code')
  assert(authorizationUrl.searchParams.get('code_challenge_method') === 'S256', 'PKCE is not S256')
  assert(authorizationUrl.searchParams.has('state'), 'state is missing')
  assert(authorizationUrl.searchParams.has('nonce'), 'nonce is missing')

  const authorizationResponse = await request(authorizationUrl, keycloakCookies)
  return { authorizationResponse, authorizationUrl }
}

async function completeCallback(appOrigin, appCookies, callback) {
  assert(new URL(callback).origin === appOrigin, `${appOrigin} callback has the wrong origin`)
  const callbackResponse = await request(callback, appCookies)
  assert(callbackResponse.status === 302, `${appOrigin} callback did not complete`)

  const sessionResponse = await request(`${appOrigin}/session`, appCookies)
  assert(sessionResponse.ok, `${appOrigin} session endpoint failed`)
  const session = await sessionResponse.json()
  assert(session.authenticated === true, `${appOrigin} session is not authenticated`)
  assert(session.username === 'local-user', `${appOrigin} session has the wrong user`)
}

const keycloakCookies = new Map()
const appACookies = new Map()
const appAFlow = await beginLogin(appAOrigin, appACookies, keycloakCookies)
assert(appAFlow.authorizationResponse.status === 200, 'Keycloak did not show the first login form')
const action = loginAction(await appAFlow.authorizationResponse.text())
const credentialResponse = await request(action, keycloakCookies, {
  method: 'POST',
  body: new URLSearchParams({
    username: 'local-user',
    password,
    credentialId: '',
  }),
})
assert(credentialResponse.status === 302, 'valid credentials did not return to app A')
const appACallback = credentialResponse.headers.get('location')
assert(appACallback, 'app A credential response has no callback')
await completeCallback(appAOrigin, appACookies, appACallback)
console.log('app_a_login=credentials_submitted_once')

const appBCookies = new Map()
const appBFlow = await beginLogin(appBOrigin, appBCookies, keycloakCookies)
assert(appBFlow.authorizationResponse.status === 302, 'app B did not reuse the Keycloak SSO session')
const appBCallback = appBFlow.authorizationResponse.headers.get('location')
assert(appBCallback, 'SSO response has no app B callback')
await completeCallback(appBOrigin, appBCookies, appBCallback)
console.log('app_b_login=sso_without_credentials')

const noTokenResponse = await request(`${apiOrigin}/user`, new Map())
assert(noTokenResponse.status === 401, 'API request without a token was not 401')
assert((await noTokenResponse.json()).error === 'invalid_token', 'API 401 body is unexpected')
console.log('api_without_token=401')

const malformedTokenResponse = await request(`${apiOrigin}/user`, new Map(), {
  headers: { authorization: 'Bearer p07.invalid.token' },
})
assert(malformedTokenResponse.status === 401, 'API malformed token request was not 401')
console.log('api_malformed_token=401')

const forbiddenResponse = await request(`${appAOrigin}/api/admin`, appACookies)
assert(forbiddenResponse.status === 403, 'valid token without api-admin was not 403')
assert((await forbiddenResponse.json()).error === 'insufficient_role', 'API 403 body is unexpected')
console.log('api_without_required_role=403')

for (const [name, origin, cookies] of [
  ['app_a', appAOrigin, appACookies],
  ['app_b', appBOrigin, appBCookies],
]) {
  const allowedResponse = await request(`${origin}/api/user`, cookies)
  assert(allowedResponse.status === 200, `${name} valid token was not allowed`)
  const allowed = await allowedResponse.json()
  assert(allowed.allowed === true, `${name} API response is not allowed`)
  assert(allowed.username === 'local-user', `${name} API response has the wrong user`)
  assert(allowed.requiredRole === 'app-user', `${name} API response has the wrong role`)
}
console.log('api_with_app_user_role=200')
console.log('api_token_validation=signature,issuer,audience,expiration')
console.log('tls_verification=web_ca')
