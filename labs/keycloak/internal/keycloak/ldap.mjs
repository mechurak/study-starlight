import { assert, createAdmin, readJson, readSecret } from './admin.mjs'

const configRoot = '/opt/keycloak-lab/keycloak'
export const ldapProviderType = 'org.keycloak.storage.UserStorageProvider'
export const ldapMapperType = 'org.keycloak.storage.ldap.mappers.LDAPStorageMapper'

export async function realmRepresentation(admin) {
  const response = await admin.success(await admin.request(''), 'read study realm')
  return response.json()
}

export async function components(admin, parentId, providerType) {
  const query = new URLSearchParams({ parent: parentId, type: providerType })
  const response = await admin.success(await admin.request(`/components?${query}`), 'query components')
  return response.json()
}

export async function upsertComponent(admin, parentId, name, representation) {
  const matching = (await components(admin, parentId, representation.providerType)).filter(
    (item) => item.name === name && item.providerId === representation.providerId,
  )
  assert(matching.length <= 1, `more than one ${name} component exists`)
  const body = { ...representation, parentId }
  await admin.success(matching.length === 0
    ? await admin.request('/components', { method: 'POST', body: JSON.stringify(body) })
    : await admin.request(`/components/${matching[0].id}`, {
        method: 'PUT', body: JSON.stringify({ ...matching[0], ...body, id: matching[0].id }),
      }), `upsert ${name} component`)
  const final = (await components(admin, parentId, representation.providerType)).filter(
    (item) => item.name === name && item.providerId === representation.providerId,
  )
  assert(final.length === 1, `expected exactly one ${name} component`)
  return final[0]
}

export async function requireLdapProvider(admin) {
  const realm = await realmRepresentation(admin)
  const matching = (await components(admin, realm.id, ldapProviderType)).filter(
    (item) => item.name === 'samba-ad' && item.providerId === 'ldap',
  )
  assert(matching.length === 1, `expected exactly one samba-ad provider, found ${matching.length}`)
  return matching[0]
}

export async function applyLdap() {
  const admin = await createAdmin()
  const realm = await realmRepresentation(admin)
  const representation = readJson(`${configRoot}/federation/samba-ad.json`)
  representation.config.bindCredential = [readSecret('/run/secrets/samba_admin_password')]
  const provider = await upsertComponent(admin, realm.id, 'samba-ad', representation)
  await admin.success(await admin.request(`/user-storage/${provider.id}/sync?action=triggerFullSync`, {
    method: 'POST',
  }), 'synchronize LDAP users')
  console.log('ldap=ldaps,read-only,user-full-sync,applied')
}
