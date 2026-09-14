import fs from 'node:fs'
import { createRemoteJWKSet, jwtVerify } from 'jose'

const origin = 'https://keycloak.keycloak.test:30080'
const issuer = `${origin}/realms/study`
const tokenEndpoint = `${issuer}/protocol/openid-connect/token`
const clientId = 'd18-worker'

function read(path) {
  const value = fs.readFileSync(path, 'utf8').trimEnd()
  if (!value) throw new Error(`empty secret: ${path}`)
  return value
}
function assert(condition, message) {
  if (!condition) throw new Error(message)
}
async function token(secret) {
  return fetch(tokenEndpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: clientId, client_secret: secret }),
    signal: AbortSignal.timeout(10_000),
  })
}
async function api(path, accessToken) {
  const headers = accessToken ? { authorization: `Bearer ${accessToken}` } : {}
  return fetch(`http://api:3000${path}`, { headers, signal: AbortSignal.timeout(10_000) })
}

const clientSecret = read('/run/secrets/d18_worker_client_secret')
const wrong = await token('not-the-client-secret')
assert(wrong.status === 401, `wrong client secret returned HTTP ${wrong.status}, expected 401`)

const response = await token(clientSecret)
assert(response.ok, `client credentials token request failed: HTTP ${response.status}`)
const result = await response.json()
assert(typeof result.access_token === 'string', 'token response has no access token')
assert(result.token_type === 'Bearer', `unexpected token type: ${result.token_type}`)
assert(!('refresh_token' in result), 'client credentials unexpectedly returned a refresh token')

const keySet = createRemoteJWKSet(new URL(`${issuer}/protocol/openid-connect/certs`))
const { payload, protectedHeader } = await jwtVerify(result.access_token, keySet, {
  algorithms: ['RS256'], issuer, audience: 'lab-api',
})
const roles = payload.realm_access?.roles
assert(protectedHeader.alg === 'RS256', 'access token does not use RS256')
assert(typeof payload.exp === 'number' && payload.exp > Math.floor(Date.now() / 1000), 'access token is expired or missing exp')
assert(payload.preferred_username === `service-account-${clientId}`, 'token subject is not the dedicated service account')
assert(Array.isArray(roles) && roles.includes('app-user'), 'access token is missing app-user')
assert(!roles.includes('api-admin'), 'access token unexpectedly includes api-admin')

const noToken = await api('/user')
const userAllowed = await api('/user', result.access_token)
const adminDenied = await api('/admin', result.access_token)
assert(noToken.status === 401, `/user without token returned HTTP ${noToken.status}`)
assert(userAllowed.status === 200, `/user with service token returned HTTP ${userAllowed.status}`)
assert(adminDenied.status === 403, `/admin with service token returned HTTP ${adminDenied.status}`)

console.log('wrong_client_secret=rejected')
console.log('grant=client_credentials')
console.log('signature_issuer_audience_exp=verified')
console.log(`subject=service-account-${clientId}`)
console.log('roles=app-user,!api-admin')
console.log('api_without_token=401')
console.log('api_user=200')
console.log('api_admin=403')
console.log('refresh_token=absent')
