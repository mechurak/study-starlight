import {
  assert, createAdmin, readJson, requireClient, requireRole, upsertClient, upsertMapper,
} from './admin.mjs'
import { ldapMapperType, requireLdapProvider, upsertComponent } from './ldap.mjs'

const configRoot = '/opt/keycloak-lab/keycloak'

async function requireGroup(admin, path) {
  const name = path.replace(/^\//, '')
  const response = await admin.success(
    await admin.request(`/groups?search=${encodeURIComponent(name)}&exact=true`), `query ${path} group`,
  )
  const matching = (await response.json()).filter((group) => group.name === name && `/${group.name}` === path)
  assert(matching.length === 1, `expected exactly one ${path} group, found ${matching.length}`)
  return matching[0]
}

export async function applyGroups() {
  const admin = await createAdmin()
  const provider = await requireLdapProvider(admin)
  const mapper = await upsertComponent(admin, provider.id, 'lab-groups',
    readJson(`${configRoot}/federation/ldap-groups.json`))
  await admin.success(await admin.request(
    `/user-storage/${provider.id}/mappers/${mapper.id}/sync?direction=fedToKeycloak`, { method: 'POST' },
  ), 'synchronize LDAP groups')
  await admin.success(await admin.request('/clear-user-cache', { method: 'POST' }), 'clear user cache')

  for (const mapping of readJson(`${configRoot}/mappings/group-roles.json`)) {
    const group = await requireGroup(admin, mapping.group)
    const path = `/groups/${group.id}/role-mappings/realm`
    const response = await admin.success(await admin.request(path), `read ${mapping.group} roles`)
    const current = await response.json()
    for (const roleName of mapping.roles) {
      if (!current.some((role) => role.name === roleName)) {
        await admin.success(await admin.request(path, {
          method: 'POST', body: JSON.stringify([await requireRole(admin, roleName)]),
        }), `grant ${roleName} to ${mapping.group}`)
      }
    }
  }
  const groupsClaim = readJson(`${configRoot}/mappers/groups-claim.json`)
  for (const clientId of ['app-a', 'app-b']) {
    await upsertMapper(admin, await requireClient(admin, clientId), groupsClaim)
  }
  console.log('groups=ldap-mapper,roles,access-token-claim,applied')
}

export async function applyLegacyDiagnostic() {
  const admin = await createAdmin()
  const diagnostic = await upsertClient(admin, {
    clientId: 'p08-diagnostic', name: 'Keycloak Lab P08 Diagnostic', enabled: true,
    protocol: 'openid-connect', publicClient: true, bearerOnly: false, standardFlowEnabled: true,
    implicitFlowEnabled: false, directAccessGrantsEnabled: false, serviceAccountsEnabled: false,
    fullScopeAllowed: true, redirectUris: ['https://p08-diagnostic.keycloak.test/callback'], webOrigins: [],
    attributes: { 'pkce.code.challenge.method': 'S256' },
  })
  await upsertMapper(admin, diagnostic, readJson(`${configRoot}/mappers/groups-claim.json`))
  await upsertMapper(admin, diagnostic, readJson(`${configRoot}/mappers/api-audience.json`))
  console.log('legacy-diagnostic=p08,applied')
}
