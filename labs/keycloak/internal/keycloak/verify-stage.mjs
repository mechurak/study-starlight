import { pathToFileURL } from 'node:url'
import {
  assert, clientsById, createAdmin, readJson, requireClient, requireUser,
} from './admin.mjs'
import { components, ldapMapperType, ldapProviderType, realmRepresentation } from './ldap.mjs'

const configRoot = '/opt/keycloak-lab/keycloak'
const stages = ['base', 'app-a', 'app-b', 'api', 'ldap', 'groups']

function isSubset(actual, expected) {
  if (Array.isArray(expected)) {
    return Array.isArray(actual) && actual.length === expected.length
      && expected.every((item, index) => isSubset(actual[index], item))
  }
  if (expected && typeof expected === 'object') {
    return actual && typeof actual === 'object'
      && Object.entries(expected).every(([key, value]) => isSubset(actual[key], value))
  }
  return actual === expected
}

function expectSubset(actual, expected, label) {
  assert(isSubset(actual, expected), `${label} does not match its public configuration`)
}

async function roleByName(admin, name) {
  const response = await admin.request(`/roles/${encodeURIComponent(name)}`)
  if (response.status === 404) return null
  await admin.success(response, `query ${name} role`)
  return response.json()
}

async function clientMapper(admin, client, name) {
  const response = await admin.success(
    await admin.request(`/clients/${client.id}/protocol-mappers/models`),
    `query ${client.clientId} mappers`,
  )
  const matching = (await response.json()).filter((mapper) => mapper.name === name)
  assert(matching.length <= 1, `expected at most one ${name} mapper on ${client.clientId}, found ${matching.length}`)
  return matching[0] ?? null
}

async function groupByPath(admin, path) {
  const name = path.replace(/^\//, '')
  const response = await admin.success(
    await admin.request(`/groups?search=${encodeURIComponent(name)}&exact=true`), `query ${path} group`,
  )
  const matching = (await response.json()).filter((group) => group.name === name)
  assert(matching.length <= 1, `expected at most one ${path} group, found ${matching.length}`)
  return matching[0] ?? null
}

async function requireConfiguredClient(admin, name) {
  const client = await requireClient(admin, name)
  expectSubset(client, readJson(`${configRoot}/clients/${name}.json`), `${name} client`)
  return client
}

async function requireMapper(admin, client, filename) {
  const expected = readJson(`${configRoot}/mappers/${filename}.json`)
  const mapper = await clientMapper(admin, client, expected.name)
  assert(mapper, `required ${expected.name} mapper is missing from ${client.clientId}`)
  expectSubset(mapper, expected, `${client.clientId} ${expected.name} mapper`)
}

async function requireApi(admin, appA, appB) {
  await requireConfiguredClient(admin, 'lab-api')
  for (const expected of readJson(`${configRoot}/roles/realm-roles.json`)) {
    const role = await roleByName(admin, expected.name)
    assert(role, `required realm role is missing: ${expected.name}`)
    expectSubset(role, expected, `${expected.name} role`)
  }

  const mapping = readJson(`${configRoot}/mappings/local-user-roles.json`)
  const user = await requireUser(admin, mapping.username)
  const response = await admin.success(
    await admin.request(`/users/${user.id}/role-mappings/realm`), `query ${mapping.username} role mappings`,
  )
  const names = new Set((await response.json()).map((role) => role.name))
  for (const name of mapping.grant) assert(names.has(name), `${mapping.username} is missing required role ${name}`)
  for (const name of mapping.revoke) assert(!names.has(name), `${mapping.username} unexpectedly has role ${name}`)
  await requireMapper(admin, appA, 'api-audience')
  await requireMapper(admin, appB, 'api-audience')
}

async function findLdap(admin) {
  const realm = await realmRepresentation(admin)
  const matching = (await components(admin, realm.id, ldapProviderType)).filter(
    (item) => item.name === 'samba-ad' && item.providerId === 'ldap',
  )
  assert(matching.length <= 1, `expected at most one samba-ad provider, found ${matching.length}`)
  return matching[0] ?? null
}

async function requireLdap(admin) {
  const provider = await findLdap(admin)
  assert(provider, 'required samba-ad provider is missing')
  const expected = readJson(`${configRoot}/federation/samba-ad.json`)
  expectSubset(provider, expected, 'samba-ad provider')
  await requireUser(admin, 'alice')
  await requireUser(admin, 'bob')
  return provider
}

async function findGroupMapper(admin, provider) {
  if (!provider) return null
  const matching = (await components(admin, provider.id, ldapMapperType)).filter(
    (item) => item.name === 'lab-groups' && item.providerId === 'group-ldap-mapper',
  )
  assert(matching.length <= 1, `expected at most one lab-groups mapper, found ${matching.length}`)
  return matching[0] ?? null
}

async function requireGroups(admin, provider, appA, appB) {
  const mapper = await findGroupMapper(admin, provider)
  assert(mapper, 'required lab-groups LDAP mapper is missing')
  expectSubset(mapper, readJson(`${configRoot}/federation/ldap-groups.json`), 'lab-groups LDAP mapper')

  for (const mapping of readJson(`${configRoot}/mappings/group-roles.json`)) {
    const group = await groupByPath(admin, mapping.group)
    assert(group, `required group is missing: ${mapping.group}`)
    const response = await admin.success(
      await admin.request(`/groups/${group.id}/role-mappings/realm`), `query ${mapping.group} role mappings`,
    )
    const names = new Set((await response.json()).map((role) => role.name))
    for (const name of mapping.roles) assert(names.has(name), `${mapping.group} is missing required role ${name}`)
  }
  await requireMapper(admin, appA, 'groups-claim')
  await requireMapper(admin, appB, 'groups-claim')
}

async function requireAbsentClient(admin, name) {
  const matching = await clientsById(admin, name)
  assert(matching.length === 0, `expected ${name} client to be absent, found ${matching.length}`)
}

async function verifyNoLaterObjects(admin, stage, appA, appB, provider) {
  const rank = stages.indexOf(stage)
  if (rank < stages.indexOf('app-a')) await requireAbsentClient(admin, 'app-a')
  if (rank < stages.indexOf('app-b')) await requireAbsentClient(admin, 'app-b')
  if (rank < stages.indexOf('api')) {
    await requireAbsentClient(admin, 'lab-api')
    for (const name of ['app-user', 'api-admin']) {
      assert(await roleByName(admin, name) === null, `expected ${name} role to be absent`)
    }
  }
  if (rank < stages.indexOf('ldap')) assert(!provider, 'expected samba-ad provider to be absent')
  if (rank < stages.indexOf('groups')) {
    assert(!await findGroupMapper(admin, provider), 'expected lab-groups LDAP mapper to be absent')
    for (const client of [appA, appB].filter(Boolean)) {
      assert(!await clientMapper(admin, client, 'ldap-groups'),
        `expected ldap-groups mapper to be absent from ${client.clientId}`)
    }
  }
}

export async function verifyStage(stage, exact = false) {
  assert(stages.includes(stage), `unsupported stage: ${stage}`)
  const admin = await createAdmin()
  const realm = await realmRepresentation(admin)
  assert(realm.realm === 'study' && realm.enabled === true, 'study realm is missing or disabled')
  await requireUser(admin, 'local-user')

  const rank = stages.indexOf(stage)
  const appA = rank >= stages.indexOf('app-a') ? await requireConfiguredClient(admin, 'app-a') : null
  const appB = rank >= stages.indexOf('app-b') ? await requireConfiguredClient(admin, 'app-b') : null
  if (rank >= stages.indexOf('api')) await requireApi(admin, appA, appB)
  const provider = rank >= stages.indexOf('ldap') ? await requireLdap(admin) : await findLdap(admin)
  if (rank >= stages.indexOf('groups')) await requireGroups(admin, provider, appA, appB)
  if (exact) await verifyNoLaterObjects(admin, stage, appA, appB, provider)
  console.log(`stage=${stage},objects=verified${exact ? ',later-objects=absent' : ''}`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const stage = process.argv[2]
  const flags = process.argv.slice(3)
  if (!stages.includes(stage) || flags.some((flag) => flag !== '--exact') || flags.length > 1) {
    console.error('usage: node verify-stage.mjs base|app-a|app-b|api|ldap|groups [--exact]')
    process.exitCode = 2
  } else {
    await verifyStage(stage, flags[0] === '--exact')
  }
}
