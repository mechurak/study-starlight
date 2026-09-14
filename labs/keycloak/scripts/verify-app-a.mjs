import fs from 'node:fs'

const appOrigin = 'https://app-a.keycloak.test:30081'
const keycloakOrigin = 'https://keycloak.keycloak.test:30080'
const expectedRedirect = `${appOrigin}/callback`
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

async function beginFlow(mutator) {
  const appCookies = new Map()
  const keycloakCookies = new Map()
  const loginResponse = await request(`${appOrigin}/login`, appCookies)
  assert(loginResponse.status === 302, 'app login did not redirect')

  const location = loginResponse.headers.get('location')
  assert(location, 'app login redirect has no location')
  const authorizationUrl = new URL(location)
  assert(authorizationUrl.origin === keycloakOrigin, 'authorization origin is not Keycloak')
  assert(authorizationUrl.searchParams.get('response_type') === 'code', 'response type is not code')
  assert(authorizationUrl.searchParams.get('redirect_uri') === expectedRedirect, 'redirect URI is not exact')
  assert(authorizationUrl.searchParams.get('code_challenge_method') === 'S256', 'PKCE method is not S256')
  assert(authorizationUrl.searchParams.has('code_challenge'), 'PKCE challenge is missing')
  assert(authorizationUrl.searchParams.has('state'), 'state is missing')
  assert(authorizationUrl.searchParams.has('nonce'), 'nonce is missing')

  mutator?.(authorizationUrl)
  const authorizationResponse = await request(authorizationUrl, keycloakCookies)
  return { appCookies, keycloakCookies, authorizationResponse }
}

async function submitLogin(flow, submittedPassword) {
  assert(flow.authorizationResponse.status === 200, 'Keycloak did not show a login form')
  const action = loginAction(await flow.authorizationResponse.text())
  return request(action, flow.keycloakCookies, {
    method: 'POST',
    body: new URLSearchParams({
      username: 'local-user',
      password: submittedPassword,
      credentialId: '',
    }),
  })
}

async function successfulLogin() {
  const flow = await beginFlow()
  const keycloakResponse = await submitLogin(flow, password)
  assert(keycloakResponse.status === 302, 'valid credentials did not redirect to app A')

  const callback = keycloakResponse.headers.get('location')
  assert(callback, 'successful login has no callback location')
  assert(new URL(callback).origin === appOrigin, 'successful login callback has wrong origin')

  const callbackResponse = await request(callback, flow.appCookies)
  assert(callbackResponse.status === 302, 'app A callback did not complete')

  const sessionResponse = await request(`${appOrigin}/session`, flow.appCookies)
  assert(sessionResponse.ok, 'app A session endpoint failed')
  const session = await sessionResponse.json()
  assert(session.authenticated === true, 'app A session is not authenticated')
  assert(session.username === 'local-user', 'app A session has the wrong user')
}

async function wrongPasswordIsRejected() {
  const flow = await beginFlow()
  const response = await submitLogin(flow, 'P06-intentionally-wrong-password')
  assert(response.status === 200, 'wrong password did not remain on the login page')
  assert(new URL(response.url).origin === keycloakOrigin, 'wrong password left Keycloak')
  loginAction(await response.text())
}

async function tamperedParameterIsRejected(parameter, replacement) {
  const flow = await beginFlow((authorizationUrl) => {
    authorizationUrl.searchParams.set(parameter, replacement)
  })
  const keycloakResponse = await submitLogin(flow, password)
  assert(keycloakResponse.status === 302, `${parameter} test did not reach app callback`)

  const callback = keycloakResponse.headers.get('location')
  assert(callback, `${parameter} test has no callback location`)
  const callbackResponse = await request(callback, flow.appCookies)
  assert(callbackResponse.status === 400, `tampered ${parameter} was not rejected`)
  assert((await callbackResponse.text()) === 'OIDC login failed', `${parameter} failure leaked details`)
}

async function invalidRedirectIsRejected() {
  const flow = await beginFlow((authorizationUrl) => {
    authorizationUrl.searchParams.set('redirect_uri', `${appOrigin}/wrong-callback`)
  })
  assert(flow.authorizationResponse.status === 400, 'unregistered redirect URI was not rejected')
  assert(new URL(flow.authorizationResponse.url).origin === keycloakOrigin, 'invalid redirect left Keycloak')
}

await successfulLogin()
console.log('authorization_code_pkce=passed')
console.log('authenticated_user=local-user')

await wrongPasswordIsRejected()
console.log('wrong_password=rejected')

await tamperedParameterIsRejected('state', 'p06-tampered-state')
console.log('tampered_state=rejected_by_callback')

await tamperedParameterIsRejected('nonce', 'p06-tampered-nonce')
console.log('tampered_nonce=rejected_by_callback')

await invalidRedirectIsRejected()
console.log('unregistered_redirect=rejected_by_keycloak')
console.log('tls_verification=web_ca')
