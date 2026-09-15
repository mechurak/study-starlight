import {
  createAdmin, readJson, requireClient, requireRole, requireUser, upsertClient, upsertMapper,
} from './admin.mjs'

const configRoot = '/opt/keycloak-lab/keycloak'

export async function applyApi() {
  const admin = await createAdmin()
  await upsertClient(admin, readJson(`${configRoot}/clients/lab-api.json`))
  for (const role of readJson(`${configRoot}/roles/realm-roles.json`)) {
    const response = await admin.request(`/roles/${encodeURIComponent(role.name)}`)
    if (response.status === 404) {
      await admin.success(await admin.request('/roles', { method: 'POST', body: JSON.stringify(role) }),
        `create ${role.name} role`)
    } else {
      await admin.success(response, `query ${role.name} role`)
      const current = await response.json()
      await admin.success(await admin.request(`/roles/${encodeURIComponent(role.name)}`, {
        method: 'PUT', body: JSON.stringify({ ...current, ...role }),
      }), `update ${role.name} role`)
    }
  }

  const mapping = readJson(`${configRoot}/mappings/local-user-roles.json`)
  const user = await requireUser(admin, mapping.username)
  const path = `/users/${user.id}/role-mappings/realm`
  const response = await admin.success(await admin.request(path), `read ${mapping.username} roles`)
  const current = await response.json()
  for (const name of mapping.grant) {
    if (!current.some((role) => role.name === name)) {
      await admin.success(await admin.request(path, {
        method: 'POST', body: JSON.stringify([await requireRole(admin, name)]),
      }), `grant ${name} to ${mapping.username}`)
    }
  }
  for (const name of mapping.revoke) {
    const role = current.find((item) => item.name === name)
    if (role) await admin.success(await admin.request(path, {
      method: 'DELETE', body: JSON.stringify([role]),
    }), `revoke ${name} from ${mapping.username}`)
  }

  const mapper = readJson(`${configRoot}/mappers/api-audience.json`)
  for (const clientId of ['app-a', 'app-b']) {
    await upsertMapper(admin, await requireClient(admin, clientId), mapper)
  }
  console.log('api=client,roles,local-user-mapping,audience,applied')
}
