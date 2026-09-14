import fs from 'node:fs'

const keycloakOrigin = 'https://keycloak.keycloak.test:30080'
const realm = 'study'
const adminApi = `${keycloakOrigin}/admin/realms/${realm}`

function readSecret(filename) {
  const value = fs.readFileSync(filename, 'utf8').trimEnd()
  if (!value) {
    throw new Error(`required seed secret is empty: ${filename}`)
  }
  return value
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

const adminPassword = readSecret('/run/secrets/keycloak_bootstrap_admin_password')
const appBSecret = readSecret('/run/secrets/app_b_client_secret')

const tokenResponse = await fetch(
  `${keycloakOrigin}/realms/master/protocol/openid-connect/token`,
  {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'password',
      client_id: 'admin-cli',
      username: 'lab-admin',
      password: adminPassword,
    }),
    signal: AbortSignal.timeout(10_000),
  },
)
assert(tokenResponse.ok, `admin authentication failed with HTTP ${tokenResponse.status}`)
const accessToken = (await tokenResponse.json()).access_token
assert(typeof accessToken === 'string' && accessToken.length > 0, 'admin access token is missing')

async function adminRequest(path, options = {}) {
  const headers = new Headers(options.headers)
  headers.set('authorization', `Bearer ${accessToken}`)
  if (options.body && !headers.has('content-type')) {
    headers.set('content-type', 'application/json')
  }
  return fetch(`${adminApi}${path}`, {
    ...options,
    headers,
    signal: AbortSignal.timeout(10_000),
  })
}

async function expectSuccess(response, operation) {
  if (!response.ok) {
    throw new Error(`${operation} failed with HTTP ${response.status}`)
  }
}

async function clientsById(clientId) {
  const response = await adminRequest(`/clients?clientId=${encodeURIComponent(clientId)}`)
  await expectSuccess(response, `query ${clientId} client`)
  const clients = await response.json()
  return clients.filter((client) => client.clientId === clientId)
}

async function requireOneClient(clientId) {
  const clients = await clientsById(clientId)
  assert(clients.length === 1, `expected exactly one ${clientId} client, found ${clients.length}`)
  return clients[0]
}

async function upsertClient(clientId, representation) {
  const clients = await clientsById(clientId)
  assert(clients.length <= 1, `more than one ${clientId} client exists`)
  const response = clients.length === 0
    ? await adminRequest('/clients', {
        method: 'POST',
        body: JSON.stringify(representation),
      })
    : await adminRequest(`/clients/${clients[0].id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...representation, id: clients[0].id }),
      })
  await expectSuccess(response, `upsert ${clientId} client`)
  return requireOneClient(clientId)
}

const appB = await upsertClient('app-b', {
  clientId: 'app-b',
  name: 'Keycloak Lab App B',
  enabled: true,
  protocol: 'openid-connect',
  clientAuthenticatorType: 'client-secret',
  publicClient: false,
  bearerOnly: false,
  standardFlowEnabled: true,
  implicitFlowEnabled: false,
  directAccessGrantsEnabled: false,
  serviceAccountsEnabled: false,
  redirectUris: ['https://app-b.keycloak.test:30082/callback'],
  webOrigins: ['https://app-b.keycloak.test:30082'],
  attributes: { 'pkce.code.challenge.method': 'S256' },
  secret: appBSecret,
})

await upsertClient('lab-api', {
  clientId: 'lab-api',
  name: 'Keycloak Lab API',
  enabled: true,
  protocol: 'openid-connect',
  bearerOnly: true,
  publicClient: false,
  standardFlowEnabled: false,
  implicitFlowEnabled: false,
  directAccessGrantsEnabled: false,
  serviceAccountsEnabled: false,
})

async function ensureRole(name) {
  const rolePath = `/roles/${encodeURIComponent(name)}`
  const current = await adminRequest(rolePath)
  if (current.status === 404) {
    await expectSuccess(
      await adminRequest('/roles', {
        method: 'POST',
        body: JSON.stringify({ name, description: `Keycloak lab ${name} role` }),
      }),
      `create ${name} role`,
    )
  } else {
    await expectSuccess(current, `query ${name} role`)
    const role = await current.json()
    await expectSuccess(
      await adminRequest(rolePath, {
        method: 'PUT',
        body: JSON.stringify({ ...role, description: `Keycloak lab ${name} role` }),
      }),
      `update ${name} role`,
    )
  }

  const response = await adminRequest(rolePath)
  await expectSuccess(response, `read ${name} role`)
  return response.json()
}

const appUserRole = await ensureRole('app-user')
const apiAdminRole = await ensureRole('api-admin')

const userResponse = await adminRequest('/users?username=local-user&exact=true')
await expectSuccess(userResponse, 'query local-user')
const users = (await userResponse.json()).filter((user) => user.username === 'local-user')
assert(users.length === 1, `expected exactly one local-user, found ${users.length}`)
const userId = users[0].id

const mappingsResponse = await adminRequest(`/users/${userId}/role-mappings/realm`)
await expectSuccess(mappingsResponse, 'read local-user realm roles')
const mappings = await mappingsResponse.json()
if (!mappings.some((role) => role.name === 'app-user')) {
  await expectSuccess(
    await adminRequest(`/users/${userId}/role-mappings/realm`, {
      method: 'POST',
      body: JSON.stringify([appUserRole]),
    }),
    'assign app-user role to local-user',
  )
}
if (mappings.some((role) => role.name === 'api-admin')) {
  await expectSuccess(
    await adminRequest(`/users/${userId}/role-mappings/realm`, {
      method: 'DELETE',
      body: JSON.stringify([apiAdminRole]),
    }),
    'remove api-admin role from local-user',
  )
}

const audienceMapper = {
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

async function ensureAudienceMapper(client) {
  const path = `/clients/${client.id}/protocol-mappers/models`
  const response = await adminRequest(path)
  await expectSuccess(response, `query ${client.clientId} protocol mappers`)
  const matching = (await response.json()).filter(
    (mapper) => mapper.name === audienceMapper.name,
  )
  assert(matching.length <= 1, `more than one audience mapper exists on ${client.clientId}`)
  await expectSuccess(
    matching.length === 0
      ? await adminRequest(path, {
          method: 'POST',
          body: JSON.stringify(audienceMapper),
        })
      : await adminRequest(`${path}/${matching[0].id}`, {
          method: 'PUT',
          body: JSON.stringify({ ...audienceMapper, id: matching[0].id }),
        }),
    `upsert ${client.clientId} audience mapper`,
  )
}

await ensureAudienceMapper(await requireOneClient('app-a'))
await ensureAudienceMapper(appB)

const finalMappingsResponse = await adminRequest(`/users/${userId}/role-mappings/realm`)
await expectSuccess(finalMappingsResponse, 'verify local-user realm roles')
const finalRoleNames = (await finalMappingsResponse.json()).map((role) => role.name)
assert(finalRoleNames.includes('app-user'), 'local-user is missing app-user')
assert(!finalRoleNames.includes('api-admin'), 'local-user unexpectedly has api-admin')

console.log('P07 app B, API audience, and realm role seed applied')
