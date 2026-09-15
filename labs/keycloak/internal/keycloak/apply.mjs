import { pathToFileURL } from 'node:url'
import { assert, readJson } from './admin.mjs'
import { applyApi } from './api.mjs'
import { applyClient } from './clients.mjs'
import { applyGroups } from './groups.mjs'
import { applyLdap } from './ldap.mjs'

export const steps = Object.freeze({
  'app-a': () => applyClient('app-a'),
  'app-b': () => applyClient('app-b'),
  api: applyApi,
  ldap: applyLdap,
  groups: applyGroups,
})

const inputs = Object.freeze({
  'app-a': ['clients/app-a.json'],
  'app-b': ['clients/app-b.json'],
  api: [
    'clients/lab-api.json', 'roles/realm-roles.json',
    'mappings/local-user-roles.json', 'mappers/api-audience.json',
  ],
  ldap: ['federation/samba-ad.json'],
  groups: [
    'federation/ldap-groups.json', 'mappings/group-roles.json', 'mappers/groups-claim.json',
  ],
})

function validateTargets(name, documents) {
  if (name === 'app-a' || name === 'app-b') {
    assert(documents[0].clientId === name, `${name} config must keep clientId=${name}`)
  } else if (name === 'api') {
    assert(documents[0].clientId === 'lab-api', 'api config must keep clientId=lab-api')
    assert(JSON.stringify(documents[1].map((role) => role.name)) === JSON.stringify(['app-user', 'api-admin']),
      'api role config must target app-user and api-admin')
    assert(documents[2].username === 'local-user', 'api role mapping must target local-user')
    assert(documents[3].name === 'lab-api-audience', 'api mapper must keep name=lab-api-audience')
  } else if (name === 'ldap') {
    assert(documents[0].name === 'samba-ad' && documents[0].providerId === 'ldap',
      'ldap config must target the samba-ad LDAP provider')
  } else if (name === 'groups') {
    assert(documents[0].name === 'lab-groups' && documents[0].providerId === 'group-ldap-mapper',
      'groups config must target the lab-groups LDAP mapper')
    assert(documents[2].name === 'ldap-groups', 'groups claim mapper must keep name=ldap-groups')
  }
}

export async function applyStep(name) {
  if (!Object.hasOwn(steps, name)) throw new Error(`unsupported apply step: ${name}`)
  const documents = inputs[name].map((filename) => readJson(`/opt/keycloak-lab/keycloak/${filename}`))
  validateTargets(name, documents)
  await steps[name]()
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const name = process.argv[2]
  if (!Object.hasOwn(steps, name)) {
    console.error('usage: node apply.mjs app-a|app-b|api|ldap|groups')
    process.exitCode = 2
  } else {
    await applyStep(name)
  }
}
