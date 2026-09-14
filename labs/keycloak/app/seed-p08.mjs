import fs from 'node:fs'

const keycloakOrigin = 'https://keycloak.keycloak.test:30080'
const realm = 'study'
const adminApi = `${keycloakOrigin}/admin/realms/${realm}`
const ldapProviderType = 'org.keycloak.storage.UserStorageProvider'
const ldapMapperType = 'org.keycloak.storage.ldap.mappers.LDAPStorageMapper'

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
const ldapBindCredential = readSecret('/run/secrets/samba_admin_password')

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
    signal: AbortSignal.timeout(30_000),
  })
}

async function expectSuccess(response, operation) {
  if (!response.ok) {
    throw new Error(`${operation} failed with HTTP ${response.status}`)
  }
}

async function realmRepresentation() {
  const response = await adminRequest('')
  await expectSuccess(response, 'read study realm')
  return response.json()
}

async function components(parentId, providerType) {
  const query = new URLSearchParams({ parent: parentId, type: providerType })
  const response = await adminRequest(`/components?${query}`)
  await expectSuccess(response, 'query components')
  return response.json()
}

async function upsertComponent(parentId, providerType, name, representation) {
  const matching = (await components(parentId, providerType)).filter(
    (component) => component.name === name && component.providerId === representation.providerId,
  )
  assert(matching.length <= 1, `more than one ${name} component exists`)

  const response = matching.length === 0
    ? await adminRequest('/components', {
        method: 'POST',
        body: JSON.stringify(representation),
      })
    : await adminRequest(`/components/${matching[0].id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...representation, id: matching[0].id }),
      })
  await expectSuccess(response, `upsert ${name} component`)

  const finalMatching = (await components(parentId, providerType)).filter(
    (component) => component.name === name && component.providerId === representation.providerId,
  )
  assert(finalMatching.length === 1, `expected exactly one ${name} component`)
  return finalMatching[0]
}

const studyRealm = await realmRepresentation()
assert(typeof studyRealm.id === 'string', 'study realm id is missing')

const ldapProvider = await upsertComponent(
  studyRealm.id,
  ldapProviderType,
  'samba-ad',
  {
    name: 'samba-ad',
    parentId: studyRealm.id,
    providerId: 'ldap',
    providerType: ldapProviderType,
    config: {
      enabled: ['true'],
      priority: ['0'],
      fullSyncPeriod: ['-1'],
      changedSyncPeriod: ['-1'],
      cachePolicy: ['DEFAULT'],
      batchSizeForSync: ['1000'],
      editMode: ['READ_ONLY'],
      importEnabled: ['true'],
      syncRegistrations: ['false'],
      vendor: ['ad'],
      usernameLDAPAttribute: ['sAMAccountName'],
      rdnLDAPAttribute: ['cn'],
      uuidLDAPAttribute: ['objectGUID'],
      userObjectClasses: ['person, organizationalPerson, user'],
      connectionUrl: ['ldaps://dc1.ad.keycloak.test:636'],
      usersDn: ['CN=Users,DC=ad,DC=keycloak,DC=test'],
      authType: ['simple'],
      startTls: ['false'],
      bindDn: ['Administrator@AD.KEYCLOAK.TEST'],
      bindCredential: [ldapBindCredential],
      searchScope: ['1'],
      validatePasswordPolicy: ['false'],
      trustEmail: ['false'],
      useTruststoreSpi: ['always'],
      connectionPooling: ['true'],
      pagination: ['true'],
      allowKerberosAuthentication: ['false'],
      useKerberosForPasswordAuthentication: ['false'],
      debug: ['false'],
      connectionTrace: ['false'],
      enableLdapPasswordPolicy: ['false'],
    },
  },
)

const groupMapper = await upsertComponent(
  ldapProvider.id,
  ldapMapperType,
  'lab-groups',
  {
    name: 'lab-groups',
    parentId: ldapProvider.id,
    providerId: 'group-ldap-mapper',
    providerType: ldapMapperType,
    config: {
      'groups.dn': ['CN=Users,DC=ad,DC=keycloak,DC=test'],
      'group.name.ldap.attribute': ['cn'],
      'group.object.classes': ['group'],
      'preserve.group.inheritance': ['false'],
      'ignore.missing.groups': ['false'],
      'membership.ldap.attribute': ['member'],
      'membership.attribute.type': ['DN'],
      'membership.user.ldap.attribute': ['sAMAccountName'],
      'groups.ldap.filter': ['(|(cn=app-users)(cn=api-admins))'],
      mode: ['READ_ONLY'],
      'user.roles.retrieve.strategy': ['LOAD_GROUPS_BY_MEMBER_ATTRIBUTE'],
      'memberof.ldap.attribute': ['memberOf'],
      'decode.group.uuid.attribute': ['true'],
      'drop.non.existing.groups.during.sync': ['false'],
      'groups.path': ['/'],
    },
  },
)

await expectSuccess(
  await adminRequest(`/user-storage/${ldapProvider.id}/sync?action=triggerFullSync`, {
    method: 'POST',
  }),
  'synchronize LDAP users',
)
await expectSuccess(
  await adminRequest(
    `/user-storage/${ldapProvider.id}/mappers/${groupMapper.id}/sync?direction=fedToKeycloak`,
    { method: 'POST' },
  ),
  'synchronize LDAP groups',
)

async function ensureRole(name) {
  const rolePath = `/roles/${encodeURIComponent(name)}`
  const response = await adminRequest(rolePath)
  if (response.status === 404) {
    await expectSuccess(
      await adminRequest('/roles', {
        method: 'POST',
        body: JSON.stringify({ name, description: `Keycloak lab ${name} role` }),
      }),
      `create ${name} role`,
    )
  } else {
    await expectSuccess(response, `query ${name} role`)
  }

  const finalResponse = await adminRequest(rolePath)
  await expectSuccess(finalResponse, `read ${name} role`)
  return finalResponse.json()
}

async function requireGroup(name) {
  const query = new URLSearchParams({ search: name, exact: 'true' })
  const response = await adminRequest(`/groups?${query}`)
  await expectSuccess(response, `query ${name} group`)
  const matching = (await response.json()).filter((group) => group.name === name)
  assert(matching.length === 1, `expected exactly one ${name} group, found ${matching.length}`)
  return matching[0]
}

async function ensureGroupRole(group, role) {
  const path = `/groups/${group.id}/role-mappings/realm`
  const response = await adminRequest(path)
  await expectSuccess(response, `read ${group.name} role mappings`)
  const mappings = await response.json()
  if (!mappings.some((mapping) => mapping.name === role.name)) {
    await expectSuccess(
      await adminRequest(path, {
        method: 'POST',
        body: JSON.stringify([role]),
      }),
      `assign ${role.name} to ${group.name}`,
    )
  }
}

const appUserRole = await ensureRole('app-user')
const apiAdminRole = await ensureRole('api-admin')
const appUsersGroup = await requireGroup('app-users')
const apiAdminsGroup = await requireGroup('api-admins')
await ensureGroupRole(appUsersGroup, appUserRole)
await ensureGroupRole(apiAdminsGroup, apiAdminRole)

async function clientsById(clientId) {
  const response = await adminRequest(`/clients?clientId=${encodeURIComponent(clientId)}`)
  await expectSuccess(response, `query ${clientId} client`)
  return (await response.json()).filter((client) => client.clientId === clientId)
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

const diagnosticClient = await upsertClient('p08-diagnostic', {
  clientId: 'p08-diagnostic',
  name: 'Keycloak Lab P08 Diagnostic',
  enabled: true,
  protocol: 'openid-connect',
  publicClient: true,
  bearerOnly: false,
  standardFlowEnabled: true,
  implicitFlowEnabled: false,
  directAccessGrantsEnabled: false,
  serviceAccountsEnabled: false,
  fullScopeAllowed: true,
  redirectUris: ['https://p08-diagnostic.keycloak.test/callback'],
  webOrigins: [],
  attributes: { 'pkce.code.challenge.method': 'S256' },
})

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
const groupClaimMapper = {
  name: 'ldap-groups',
  protocol: 'openid-connect',
  protocolMapper: 'oidc-group-membership-mapper',
  consentRequired: false,
  config: {
    'claim.name': 'groups',
    'full.path': 'true',
    'id.token.claim': 'false',
    'access.token.claim': 'true',
    'userinfo.token.claim': 'false',
    'introspection.token.claim': 'true',
  },
}

async function ensureProtocolMapper(client, mapper) {
  const path = `/clients/${client.id}/protocol-mappers/models`
  const response = await adminRequest(path)
  await expectSuccess(response, `query ${client.clientId} protocol mappers`)
  const matching = (await response.json()).filter((current) => current.name === mapper.name)
  assert(matching.length <= 1, `more than one ${mapper.name} mapper exists on ${client.clientId}`)
  await expectSuccess(
    matching.length === 0
      ? await adminRequest(path, {
          method: 'POST',
          body: JSON.stringify(mapper),
        })
      : await adminRequest(`${path}/${matching[0].id}`, {
          method: 'PUT',
          body: JSON.stringify({ ...mapper, id: matching[0].id }),
        }),
    `upsert ${client.clientId} ${mapper.name} mapper`,
  )
}

for (const client of [
  await requireOneClient('app-a'),
  await requireOneClient('app-b'),
  diagnosticClient,
]) {
  await ensureProtocolMapper(client, groupClaimMapper)
}
await ensureProtocolMapper(diagnosticClient, audienceMapper)

async function requireUser(username, federationLink) {
  const query = new URLSearchParams({ username, exact: 'true' })
  const response = await adminRequest(`/users?${query}`)
  await expectSuccess(response, `query ${username}`)
  const matching = (await response.json()).filter((user) => user.username === username)
  assert(matching.length === 1, `expected exactly one ${username} user, found ${matching.length}`)
  assert(
    (matching[0].federationLink ?? null) === federationLink,
    `${username} has an unexpected federation link`,
  )
  return matching[0]
}

async function userGroups(user) {
  const response = await adminRequest(`/users/${user.id}/groups`)
  await expectSuccess(response, `query ${user.username} groups`)
  return (await response.json()).map((group) => group.name).sort()
}

const alice = await requireUser('alice', ldapProvider.id)
const bob = await requireUser('bob', ldapProvider.id)
const localUser = await requireUser('local-user', null)
assert(
  JSON.stringify(await userGroups(alice)) === JSON.stringify(['api-admins', 'app-users']),
  'alice Keycloak groups do not match LDAP groups',
)
assert(
  JSON.stringify(await userGroups(bob)) === JSON.stringify(['app-users']),
  'bob Keycloak groups do not match LDAP groups',
)

const localRolesResponse = await adminRequest(`/users/${localUser.id}/role-mappings/realm`)
await expectSuccess(localRolesResponse, 'read local-user realm roles')
const localRoles = (await localRolesResponse.json()).map((role) => role.name)
assert(localRoles.includes('app-user'), 'local-user is missing its P07 app-user role')
assert(!localRoles.includes('api-admin'), 'local-user unexpectedly has api-admin')

const finalProvider = (await components(studyRealm.id, ldapProviderType)).find(
  (component) => component.id === ldapProvider.id,
)
assert(finalProvider?.config?.editMode?.[0] === 'READ_ONLY', 'LDAP provider is not READ_ONLY')
assert(
  finalProvider?.config?.connectionUrl?.[0] === 'ldaps://dc1.ad.keycloak.test:636',
  'LDAP provider connection URL is not the fixed LDAPS endpoint',
)
assert(finalProvider?.config?.startTls?.[0] === 'false', 'LDAP provider unexpectedly uses StartTLS')
assert(
  finalProvider?.config?.allowKerberosAuthentication?.[0] === 'false',
  'LDAP provider unexpectedly enables Kerberos',
)

console.log('federation=ldaps_only,read_only,import_enabled')
console.log('ldap_group_mapper=app-users,api-admins')
console.log('keycloak_memberships=alice(app-users,api-admins),bob(app-users)')
console.log('group_roles=app-users(app-user),api-admins(api-admin)')
console.log('protocol_claim_mapper=groups_access_token')
console.log('p07_local_user=preserved')
