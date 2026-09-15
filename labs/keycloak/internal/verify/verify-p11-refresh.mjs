import fs from 'node:fs'
// Historical detailed verification.

import { createRemoteJWKSet, jwtVerify } from 'jose'
import * as oidc from 'openid-client'

const keycloakOrigin = 'https://keycloak.keycloak.test:30080'
const issuer = `${keycloakOrigin}/realms/study`
const apiOrigin = 'http://api:3000'
const clientId = 'p08-diagnostic'
const redirectUri = 'https://p08-diagnostic.keycloak.test/callback'
const password = fs.readFileSync('/run/secrets/samba_alice_password', 'utf8').trimEnd()

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
  assert(action, 'Keycloak login form action was not found')
  return decodeHtmlAttribute(action)
}

const configuration = await oidc.discovery(new URL(issuer), clientId)
const metadata = configuration.serverMetadata()
assert(metadata.issuer === issuer, 'OIDC discovery issuer is wrong')
assert(typeof metadata.jwks_uri === 'string', 'OIDC discovery has no JWKS URI')
assert(typeof metadata.token_endpoint === 'string', 'OIDC discovery has no token endpoint')
const jwksUrl = new URL(metadata.jwks_uri)
assert(jwksUrl.protocol === 'https:', 'JWKS URL is not HTTPS')
assert(jwksUrl.origin === keycloakOrigin, 'JWKS URL origin is wrong')
const keySet = createRemoteJWKSet(jwksUrl)

const codeVerifier = oidc.randomPKCECodeVerifier()
const state = oidc.randomState()
const nonce = oidc.randomNonce()
const authorizationUrl = oidc.buildAuthorizationUrl(configuration, {
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
const loginResponse = await request(authorizationUrl, cookies)
assert(loginResponse.status === 200, 'alice did not receive a login form')
const credentialResponse = await request(loginAction(await loginResponse.text()), cookies, {
  method: 'POST',
  body: new URLSearchParams({ username: 'alice', password, credentialId: '' }),
})
const callback = credentialResponse.headers.get('location')
assert(credentialResponse.status === 302 && callback, 'alice credentials were not accepted')
assert(new URL(callback).origin === new URL(redirectUri).origin, 'diagnostic callback origin is wrong')

const tokens = await oidc.authorizationCodeGrant(configuration, new URL(callback), {
  pkceCodeVerifier: codeVerifier,
  expectedState: state,
  expectedNonce: nonce,
  idTokenExpected: true,
})
assert(typeof tokens.access_token === 'string', 'initial access token is missing')
assert(typeof tokens.refresh_token === 'string', 'refresh token is missing')

const refreshResponse = await fetch(metadata.token_endpoint, {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: clientId,
    refresh_token: tokens.refresh_token,
  }),
  signal: AbortSignal.timeout(30_000),
})
assert(refreshResponse.status === 200, `refresh was rejected with HTTP ${refreshResponse.status}`)
const refreshed = await refreshResponse.json()
assert(typeof refreshed.access_token === 'string', 'refreshed access token is missing')

const { payload } = await jwtVerify(refreshed.access_token, keySet, {
  algorithms: ['RS256'],
  issuer,
  audience: 'lab-api',
})
assert(typeof payload.exp === 'number', 'refreshed access token expiration is missing')
const groups = Array.isArray(payload.groups) ? [...payload.groups].sort() : []
const roles = Array.isArray(payload.realm_access?.roles)
  ? payload.realm_access.roles.filter((role) => ['app-user', 'api-admin'].includes(role)).sort()
  : []
assert(JSON.stringify(groups) === JSON.stringify(['/api-admins', '/app-users']), 'refreshed groups are wrong')
assert(JSON.stringify(roles) === JSON.stringify(['api-admin', 'app-user']), 'refreshed roles are wrong')

const headers = { authorization: `Bearer ${refreshed.access_token}` }
const userResponse = await fetch(`${apiOrigin}/user`, {
  headers,
  signal: AbortSignal.timeout(10_000),
})
const adminResponse = await fetch(`${apiOrigin}/admin`, {
  headers,
  signal: AbortSignal.timeout(10_000),
})
assert(userResponse.status === 200 && adminResponse.status === 200, 'refreshed token API result is wrong')

console.log('user=alice')
console.log('flow=authorization_code,pkce_s256,state,nonce,refresh_token')
console.log('refresh=accepted,http:200')
console.log('refreshed_groups=/api-admins,/app-users')
console.log('refreshed_realm_roles=api-admin,app-user')
console.log('refreshed_token_api=user:200,admin:200')
console.log('token_validation=signature,issuer,audience,expiration')
console.log('tls_verification=web_ca')
