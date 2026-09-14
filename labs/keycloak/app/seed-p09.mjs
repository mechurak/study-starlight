import fs from 'node:fs'

const keycloakOrigin = 'https://keycloak.keycloak.test:30080'
const realm = 'study'
const adminApi = `${keycloakOrigin}/admin/realms/${realm}`
const ldapProviderType = 'org.keycloak.storage.UserStorageProvider'
const ldapMapperType = 'org.keycloak.storage.ldap.mappers.LDAPStorageMapper'
const action = process.env.P09_ACTION ?? 'inspect'

function readSecret(filename) {
  const value = fs.readFileSync(filename, 'utf8').trimEnd()
  if (!value) throw new Error('required admin secret is empty')
  return value
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const tokenResponse = await fetch(`${keycloakOrigin}/realms/master/protocol/openid-connect/token`, {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'password',
    client_id: 'admin-cli',
    username: 'lab-admin',
    password: readSecret('/run/secrets/keycloak_bootstrap_admin_password'),
  }),
  signal: AbortSignal.timeout(10_000),
})
assert(tokenResponse.ok, `admin authentication failed with HTTP ${tokenResponse.status}`)
const accessToken = (await tokenResponse.json()).access_token
assert(typeof accessToken === 'string' && accessToken.length > 0, 'admin access token is missing')

async function adminRequest(path, options = {}) {
  const headers = new Headers(options.headers)
  headers.set('authorization', `Bearer ${accessToken}`)
  if (options.body && !headers.has('content-type')) headers.set('content-type', 'application/json')
  return fetch(`${adminApi}${path}`, {
    ...options,
    headers,
    signal: AbortSignal.timeout(30_000),
  })
}

async function json(path, operation) {
  const response = await adminRequest(path)
  assert(response.ok, `${operation} failed with HTTP ${response.status}`)
  return response.json()
}

async function post(path, operation) {
  const response = await adminRequest(path, { method: 'POST' })
  assert(response.ok, `${operation} failed with HTTP ${response.status}`)
}

const realmRepresentation = await json('', 'read study realm')
const providers = await json(
  `/components?${new URLSearchParams({ parent: realmRepresentation.id, type: ldapProviderType })}`,
  'query LDAP providers',
)
const matchingProviders = providers.filter(
  (provider) => provider.name === 'samba-ad' && provider.providerId === 'ldap',
)
assert(matchingProviders.length === 1, 'expected exactly one samba-ad provider')
const provider = matchingProviders[0]
const mappers = await json(
  `/components?${new URLSearchParams({ parent: provider.id, type: ldapMapperType })}`,
  'query LDAP mappers',
)
const matchingGroupMappers = mappers.filter(
  (mapper) => mapper.name === 'lab-groups' && mapper.providerId === 'group-ldap-mapper',
)
assert(matchingGroupMappers.length === 1, 'expected exactly one lab-groups mapper')
const groupMapper = matchingGroupMappers[0]
const accountControlMapper = mappers.find(
  (mapper) => mapper.providerId === 'msad-user-account-control-mapper',
)
assert(accountControlMapper, 'MSAD account control mapper is missing')

async function syncUsers() {
  await post(`/user-storage/${provider.id}/sync?action=triggerFullSync`, 'full LDAP user sync')
}

async function syncGroups() {
  await post(
    `/user-storage/${provider.id}/mappers/${groupMapper.id}/sync?direction=fedToKeycloak`,
    'LDAP group sync',
  )
}

async function clearUserCache() {
  await post('/clear-user-cache', 'clear realm user cache')
}

async function user(username) {
  const users = await json(
    `/users?${new URLSearchParams({ username, exact: 'true' })}`,
    `query ${username}`,
  )
  const matching = users.filter((candidate) => candidate.username === username)
  assert(matching.length === 1, `expected exactly one ${username} user`)
  return matching[0]
}

async function groupNames(currentUser) {
  return (await json(`/users/${currentUser.id}/groups`, `query ${currentUser.username} groups`))
    .map((group) => group.name)
    .filter((name) => ['app-users', 'api-admins'].includes(name))
    .sort()
}

async function assertState({ aliceEnabled, aliceGroups }) {
  const alice = await user('alice')
  const bob = await user('bob')
  assert(alice.enabled === aliceEnabled, `alice enabled=${alice.enabled}, expected ${aliceEnabled}`)
  assert(
    JSON.stringify(await groupNames(alice)) === JSON.stringify(aliceGroups),
    'alice Keycloak groups do not match the expected state',
  )
  assert(
    JSON.stringify(await groupNames(bob)) === JSON.stringify(['app-users']),
    'bob Keycloak groups changed',
  )
}

switch (action) {
  case 'inspect':
    await assertState({ aliceEnabled: true, aliceGroups: ['api-admins', 'app-users'] })
    break
  case 'group-removed':
    await syncGroups()
    await clearUserCache()
    await assertState({ aliceEnabled: true, aliceGroups: ['app-users'] })
    break
  case 'user-disabled':
    await syncUsers()
    await clearUserCache()
    await assertState({ aliceEnabled: false, aliceGroups: ['api-admins', 'app-users'] })
    break
  case 'restore':
    await syncUsers()
    await syncGroups()
    await clearUserCache()
    await assertState({ aliceEnabled: true, aliceGroups: ['api-admins', 'app-users'] })
    break
  default:
    throw new Error(`unsupported P09 action: ${action}`)
}

assert(provider.config?.editMode?.[0] === 'READ_ONLY', 'LDAP provider is not READ_ONLY')
assert(provider.config?.importEnabled?.[0] === 'true', 'LDAP provider does not import users')
assert(provider.config?.cachePolicy?.[0] === 'DEFAULT', 'LDAP cache policy changed')
assert(provider.config?.fullSyncPeriod?.[0] === '-1', 'periodic full sync setting changed')
assert(provider.config?.changedSyncPeriod?.[0] === '-1', 'periodic changed sync setting changed')

console.log(`action=${action}`)
console.log(`alice_enabled=${(await user('alice')).enabled}`)
console.log(`alice_groups=${(await groupNames(await user('alice'))).join(',')}`)
console.log('bob_enabled=true')
console.log('bob_groups=app-users')
console.log('provider_edit_mode=READ_ONLY')
console.log('provider_import_users=true')
console.log('provider_cache_policy=DEFAULT')
console.log('provider_full_sync_period_seconds=-1')
console.log('provider_changed_sync_period_seconds=-1')
console.log(
  `account_control_always_read_enabled_from_ldap=${accountControlMapper.config?.['always.read.enabled.value.from.ldap']?.[0] ?? 'false'}`,
)
console.log(`realm_access_token_lifespan_seconds=${realmRepresentation.accessTokenLifespan}`)
console.log(`realm_sso_session_idle_seconds=${realmRepresentation.ssoSessionIdleTimeout}`)
console.log(`realm_sso_session_max_seconds=${realmRepresentation.ssoSessionMaxLifespan}`)
console.log(`realm_client_session_idle_seconds=${realmRepresentation.clientSessionIdleTimeout ?? 0}`)
console.log(`realm_client_session_max_seconds=${realmRepresentation.clientSessionMaxLifespan ?? 0}`)
console.log(`realm_revoke_refresh_token=${realmRepresentation.revokeRefreshToken}`)
console.log(`user_cache_clear=${action === 'inspect' ? 'not_run' : 'after_sync'}`)
