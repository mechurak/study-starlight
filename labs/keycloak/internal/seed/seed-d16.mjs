import fs from 'node:fs'
// Optional brokering lab seed.

const origin = 'https://keycloak.keycloak.test:30080'
const upstreamRealm = 'd16-upstream'
const studyRealm = 'study'
const upstreamUsername = 'd16-upstream-user'
const idpAlias = 'upstream-oidc'

function secret(path) {
  const value = fs.readFileSync(path, 'utf8').trimEnd()
  if (!value) throw new Error(`empty secret: ${path}`)
  return value
}
function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const adminPassword = secret('/run/secrets/keycloak_bootstrap_admin_password')
const upstreamClientSecret = secret('/run/secrets/d16_upstream_client_secret')
const upstreamUserPassword = secret('/run/secrets/d16_upstream_user_password')
const tokenResponse = await fetch(`${origin}/realms/master/protocol/openid-connect/token`, {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ grant_type: 'password', client_id: 'admin-cli', username: 'lab-admin', password: adminPassword }),
  signal: AbortSignal.timeout(10_000),
})
assert(tokenResponse.ok, `admin authentication failed: HTTP ${tokenResponse.status}`)
const token = (await tokenResponse.json()).access_token

async function request(path, options = {}) {
  const headers = new Headers(options.headers)
  headers.set('authorization', `Bearer ${token}`)
  if (options.body) headers.set('content-type', 'application/json')
  return fetch(`${origin}/admin${path}`, { ...options, headers, signal: AbortSignal.timeout(20_000) })
}
async function get(path) {
  const response = await request(path)
  assert(response.ok, `GET ${path} failed: HTTP ${response.status}`)
  return response.json()
}
async function succeed(path, options, operation) {
  const response = await request(path, options)
  assert(response.ok, `${operation} failed: HTTP ${response.status}`)
}
async function upsertClient(realm, clientId, representation) {
  let clients = (await get(`/realms/${realm}/clients?clientId=${clientId}`)).filter((client) => client.clientId === clientId)
  assert(clients.length <= 1, `more than one ${realm}/${clientId} client exists`)
  if (clients.length === 0) {
    await succeed(`/realms/${realm}/clients`, { method: 'POST', body: JSON.stringify(representation) }, `create ${realm}/${clientId}`)
  } else {
    await succeed(`/realms/${realm}/clients/${clients[0].id}`, {
      method: 'PUT', body: JSON.stringify({ ...representation, id: clients[0].id }),
    }, `update ${realm}/${clientId}`)
  }
  clients = (await get(`/realms/${realm}/clients?clientId=${clientId}`)).filter((client) => client.clientId === clientId)
  assert(clients.length === 1, `expected one ${realm}/${clientId} client`)
}

const upstreamResponse = await request(`/realms/${upstreamRealm}`)
if (upstreamResponse.status === 404) {
  await succeed('/realms', {
    method: 'POST',
    body: JSON.stringify({ realm: upstreamRealm, displayName: 'D16 Upstream OIDC', enabled: true }),
  }, 'create upstream realm')
} else {
  assert(upstreamResponse.ok, `query upstream realm failed: HTTP ${upstreamResponse.status}`)
}

await upsertClient(upstreamRealm, 'study-broker', {
  clientId: 'study-broker',
  name: 'Study Realm OIDC Broker',
  enabled: true,
  protocol: 'openid-connect',
  publicClient: false,
  secret: upstreamClientSecret,
  standardFlowEnabled: true,
  implicitFlowEnabled: false,
  directAccessGrantsEnabled: false,
  serviceAccountsEnabled: false,
  redirectUris: [`${origin}/realms/${studyRealm}/broker/${idpAlias}/endpoint`],
  webOrigins: [],
})

let upstreamUsers = (await get(`/realms/${upstreamRealm}/users?username=${upstreamUsername}&exact=true`))
  .filter((user) => user.username === upstreamUsername)
assert(upstreamUsers.length <= 1, 'duplicate upstream diagnostic users exist')
const upstreamProfile = {
  username: upstreamUsername,
  firstName: 'D16',
  lastName: 'Upstream',
  email: 'd16-upstream-user@example.invalid',
  emailVerified: true,
  enabled: true,
}
if (upstreamUsers.length === 0) {
  await succeed(`/realms/${upstreamRealm}/users`, {
    method: 'POST', body: JSON.stringify(upstreamProfile),
  }, 'create upstream user')
  upstreamUsers = (await get(`/realms/${upstreamRealm}/users?username=${upstreamUsername}&exact=true`))
    .filter((user) => user.username === upstreamUsername)
}
assert(upstreamUsers.length === 1, 'expected one upstream diagnostic user')
await succeed(`/realms/${upstreamRealm}/users/${upstreamUsers[0].id}`, {
  method: 'PUT', body: JSON.stringify({ ...upstreamUsers[0], ...upstreamProfile }),
}, 'update upstream user profile')
await succeed(`/realms/${upstreamRealm}/users/${upstreamUsers[0].id}/reset-password`, {
  method: 'PUT', body: JSON.stringify({ type: 'password', value: upstreamUserPassword, temporary: false }),
}, 'reset upstream user password')

await upsertClient(studyRealm, 'd16-broker-diagnostic', {
  clientId: 'd16-broker-diagnostic',
  name: 'D16 Broker Diagnostic',
  enabled: true,
  protocol: 'openid-connect',
  publicClient: true,
  standardFlowEnabled: true,
  implicitFlowEnabled: false,
  directAccessGrantsEnabled: false,
  serviceAccountsEnabled: false,
  redirectUris: ['https://d16-broker.keycloak.test/callback'],
  webOrigins: [],
  attributes: { 'pkce.code.challenge.method': 'S256' },
})

const idpRepresentation = {
  alias: idpAlias,
  displayName: 'D16 Upstream OIDC',
  providerId: 'oidc',
  enabled: true,
  updateProfileFirstLoginMode: 'on',
  trustEmail: true,
  storeToken: false,
  addReadTokenRoleOnCreate: false,
  authenticateByDefault: false,
  linkOnly: false,
  firstBrokerLoginFlowAlias: 'first broker login',
  config: {
    clientId: 'study-broker',
    clientSecret: upstreamClientSecret,
    authorizationUrl: `${origin}/realms/${upstreamRealm}/protocol/openid-connect/auth`,
    tokenUrl: `${origin}/realms/${upstreamRealm}/protocol/openid-connect/token`,
    userInfoUrl: `${origin}/realms/${upstreamRealm}/protocol/openid-connect/userinfo`,
    jwksUrl: `${origin}/realms/${upstreamRealm}/protocol/openid-connect/certs`,
    issuer: `${origin}/realms/${upstreamRealm}`,
    useJwksUrl: 'true',
    validateSignature: 'true',
    defaultScope: 'openid profile email',
    syncMode: 'IMPORT',
  },
}
const idpResponse = await request(`/realms/${studyRealm}/identity-provider/instances/${idpAlias}`)
if (idpResponse.status === 404) {
  await succeed(`/realms/${studyRealm}/identity-provider/instances`, {
    method: 'POST', body: JSON.stringify(idpRepresentation),
  }, 'create upstream OIDC provider')
} else {
  assert(idpResponse.ok, `query identity provider failed: HTTP ${idpResponse.status}`)
  await succeed(`/realms/${studyRealm}/identity-provider/instances/${idpAlias}`, {
    method: 'PUT', body: JSON.stringify(idpRepresentation),
  }, 'update upstream OIDC provider')
}

for (const candidate of (await get(`/realms/${studyRealm}/users?username=${upstreamUsername}&exact=true`))
  .filter((user) => user.username === upstreamUsername)) {
  const links = await get(`/realms/${studyRealm}/users/${candidate.id}/federated-identity`)
  if (links.some((link) => link.identityProvider === idpAlias)) {
    await succeed(`/realms/${studyRealm}/users/${candidate.id}`, { method: 'DELETE' }, 'reset prior broker user')
  }
}

console.log(`upstream_realm=${upstreamRealm}`)
console.log('upstream_client=study-broker')
console.log(`identity_provider=${idpAlias}`)
console.log('protocol=openid-connect')
console.log('signature_validation=jwks')
console.log('sync_mode=IMPORT')
console.log('store_external_token=false')
console.log('first_login_flow=first broker login')
console.log('diagnostic_client_pkce=S256')
