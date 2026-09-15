import fs from 'node:fs'

export const keycloakOrigin = 'https://keycloak.keycloak.test:30080'
export const realm = 'study'

export function assert(condition, message) {
  if (!condition) throw new Error(message)
}

export function readSecret(filename) {
  const value = fs.readFileSync(filename, 'utf8').trimEnd()
  assert(value, `required secret is empty: ${filename}`)
  return value
}

export function readJson(filename) {
  return JSON.parse(fs.readFileSync(filename, 'utf8'))
}

export async function createAdmin() {
  const password = readSecret('/run/secrets/keycloak_bootstrap_admin_password')
  const response = await fetch(`${keycloakOrigin}/realms/master/protocol/openid-connect/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'password', client_id: 'admin-cli', username: 'lab-admin', password,
    }),
    signal: AbortSignal.timeout(10_000),
  })
  assert(response.ok, `admin authentication failed with HTTP ${response.status}`)
  const accessToken = (await response.json()).access_token
  assert(typeof accessToken === 'string' && accessToken, 'admin access token is missing')

  async function request(path, options = {}) {
    const headers = new Headers(options.headers)
    headers.set('authorization', `Bearer ${accessToken}`)
    if (options.body && !headers.has('content-type')) headers.set('content-type', 'application/json')
    return fetch(`${keycloakOrigin}/admin/realms/${realm}${path}`, {
      ...options, headers, signal: AbortSignal.timeout(30_000),
    })
  }

  async function success(response, operation) {
    if (!response.ok) {
      const detail = (await response.text()).slice(0, 300)
      throw new Error(`${operation} failed with HTTP ${response.status}${detail ? `: ${detail}` : ''}`)
    }
    return response
  }

  async function one(path, predicate, label) {
    const response = await success(await request(path), `query ${label}`)
    const matching = (await response.json()).filter(predicate)
    assert(matching.length === 1, `expected exactly one ${label}, found ${matching.length}`)
    return matching[0]
  }

  return { request, success, one }
}

export async function clientsById(admin, clientId) {
  const response = await admin.success(
    await admin.request(`/clients?clientId=${encodeURIComponent(clientId)}`),
    `query ${clientId} client`,
  )
  return (await response.json()).filter((client) => client.clientId === clientId)
}

export async function requireClient(admin, clientId) {
  const clients = await clientsById(admin, clientId)
  assert(clients.length === 1, `expected exactly one ${clientId} client, found ${clients.length}`)
  return clients[0]
}

export async function upsertClient(admin, representation, secret) {
  const clients = await clientsById(admin, representation.clientId)
  assert(clients.length <= 1, `more than one ${representation.clientId} client exists`)
  if (clients.length === 0) {
    await admin.success(await admin.request('/clients', {
      method: 'POST', body: JSON.stringify({ ...representation, ...(secret ? { secret } : {}) }),
    }), `create ${representation.clientId} client`)
  } else {
    const currentResponse = await admin.success(
      await admin.request(`/clients/${clients[0].id}`), `read ${representation.clientId} client`,
    )
    const current = await currentResponse.json()
    await admin.success(await admin.request(`/clients/${clients[0].id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...current, ...representation, id: clients[0].id, ...(secret ? { secret } : {}) }),
    }), `update ${representation.clientId} client`)
  }
  return requireClient(admin, representation.clientId)
}

export async function upsertMapper(admin, client, mapper) {
  const path = `/clients/${client.id}/protocol-mappers/models`
  const response = await admin.success(await admin.request(path), `query ${client.clientId} mappers`)
  const matching = (await response.json()).filter((item) => item.name === mapper.name)
  assert(matching.length <= 1, `more than one ${mapper.name} mapper exists on ${client.clientId}`)
  await admin.success(matching.length === 0
    ? await admin.request(path, { method: 'POST', body: JSON.stringify(mapper) })
    : await admin.request(`${path}/${matching[0].id}`, {
        method: 'PUT', body: JSON.stringify({ ...matching[0], ...mapper, id: matching[0].id }),
      }), `upsert ${client.clientId} ${mapper.name} mapper`)
}

export async function requireUser(admin, username) {
  return admin.one(`/users?username=${encodeURIComponent(username)}&exact=true`,
    (user) => user.username === username, `${username} user`)
}

export async function requireRole(admin, name) {
  const response = await admin.request(`/roles/${encodeURIComponent(name)}`)
  assert(response.ok, `required realm role is missing: ${name}`)
  return response.json()
}
