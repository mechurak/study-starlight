import fs from 'node:fs'

const origin = 'https://keycloak.keycloak.test:30080'
const realm = 'study'
const clientId = 'd18-worker'

function secret(path) {
  const value = fs.readFileSync(path, 'utf8').trimEnd()
  if (!value) throw new Error(`empty secret: ${path}`)
  return value
}
function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const adminPassword = secret('/run/secrets/keycloak_bootstrap_admin_password')
const clientSecret = secret('/run/secrets/d18_worker_client_secret')
const tokenResponse = await fetch(`${origin}/realms/master/protocol/openid-connect/token`, {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ grant_type: 'password', client_id: 'admin-cli', username: 'lab-admin', password: adminPassword }),
  signal: AbortSignal.timeout(10_000),
})
assert(tokenResponse.ok, `admin authentication failed: HTTP ${tokenResponse.status}`)
const adminToken = (await tokenResponse.json()).access_token

async function request(path, options = {}) {
  const headers = new Headers(options.headers)
  headers.set('authorization', `Bearer ${adminToken}`)
  if (options.body) headers.set('content-type', 'application/json')
  return fetch(`${origin}/admin/realms/${realm}${path}`, {
    ...options, headers, signal: AbortSignal.timeout(20_000),
  })
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

let clients = (await get(`/clients?clientId=${clientId}`)).filter((client) => client.clientId === clientId)
assert(clients.length <= 1, `more than one ${clientId} client exists`)
const representation = {
  clientId,
  name: 'D18 Service Account Worker',
  enabled: true,
  protocol: 'openid-connect',
  clientAuthenticatorType: 'client-secret',
  publicClient: false,
  bearerOnly: false,
  standardFlowEnabled: false,
  implicitFlowEnabled: false,
  directAccessGrantsEnabled: false,
  serviceAccountsEnabled: true,
  fullScopeAllowed: false,
  secret: clientSecret,
}
if (clients.length === 0) {
  await succeed('/clients', { method: 'POST', body: JSON.stringify(representation) }, `create ${clientId}`)
} else {
  await succeed(`/clients/${clients[0].id}`, {
    method: 'PUT', body: JSON.stringify({ ...representation, id: clients[0].id }),
  }, `update ${clientId}`)
}
clients = (await get(`/clients?clientId=${clientId}`)).filter((client) => client.clientId === clientId)
assert(clients.length === 1, `expected exactly one ${clientId} client`)
const client = clients[0]

const appUserRole = await get('/roles/app-user')
const apiAdminRole = await get('/roles/api-admin')
const serviceAccount = await get(`/clients/${client.id}/service-account-user`)
let assignedRoles = await get(`/users/${serviceAccount.id}/role-mappings/realm`)
if (!assignedRoles.some((role) => role.name === appUserRole.name)) {
  await succeed(`/users/${serviceAccount.id}/role-mappings/realm`, {
    method: 'POST', body: JSON.stringify([appUserRole]),
  }, 'assign app-user to the service account')
}
if (assignedRoles.some((role) => role.name === apiAdminRole.name)) {
  await succeed(`/users/${serviceAccount.id}/role-mappings/realm`, {
    method: 'DELETE', body: JSON.stringify([apiAdminRole]),
  }, 'remove api-admin from the service account')
}

let scopedRoles = await get(`/clients/${client.id}/scope-mappings/realm`)
if (!scopedRoles.some((role) => role.name === appUserRole.name)) {
  await succeed(`/clients/${client.id}/scope-mappings/realm`, {
    method: 'POST', body: JSON.stringify([appUserRole]),
  }, 'add app-user to the client role scope')
}
if (scopedRoles.some((role) => role.name === apiAdminRole.name)) {
  await succeed(`/clients/${client.id}/scope-mappings/realm`, {
    method: 'DELETE', body: JSON.stringify([apiAdminRole]),
  }, 'remove api-admin from the client role scope')
}

const mapper = {
  name: 'lab-api-audience',
  protocol: 'openid-connect',
  protocolMapper: 'oidc-audience-mapper',
  consentRequired: false,
  config: {
    'included.client.audience': 'lab-api',
    'id.token.claim': 'false',
    'access.token.claim': 'true',
    'introspection.token.claim': 'true',
  },
}
const mapperPath = `/clients/${client.id}/protocol-mappers/models`
const matchingMappers = (await get(mapperPath)).filter((candidate) => candidate.name === mapper.name)
assert(matchingMappers.length <= 1, 'more than one lab-api audience mapper exists')
if (matchingMappers.length === 0) {
  await succeed(mapperPath, { method: 'POST', body: JSON.stringify(mapper) }, 'create audience mapper')
} else {
  await succeed(`${mapperPath}/${matchingMappers[0].id}`, {
    method: 'PUT', body: JSON.stringify({ ...mapper, id: matchingMappers[0].id }),
  }, 'update audience mapper')
}

assignedRoles = await get(`/users/${serviceAccount.id}/role-mappings/realm`)
scopedRoles = await get(`/clients/${client.id}/scope-mappings/realm`)
assert(assignedRoles.some((role) => role.name === 'app-user'), 'service account is missing app-user')
assert(!assignedRoles.some((role) => role.name === 'api-admin'), 'service account unexpectedly has api-admin')
assert(scopedRoles.some((role) => role.name === 'app-user'), 'client scope is missing app-user')
assert(!scopedRoles.some((role) => role.name === 'api-admin'), 'client scope unexpectedly has api-admin')

console.log(`client=${clientId}`)
console.log('grant=client_credentials')
console.log('full_scope_allowed=false')
console.log('service_account_role=app-user')
console.log('excluded_role=api-admin')
console.log('audience=lab-api')
