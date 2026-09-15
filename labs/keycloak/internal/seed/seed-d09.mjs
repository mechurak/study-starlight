import fs from 'node:fs'
// Optional MFA lab seed.

const origin = 'https://keycloak.keycloak.test:30080'
const realm = 'study'
const adminApi = `${origin}/admin/realms/${realm}`
const flowAlias = 'd09-browser-otp'
const clientId = 'd09-mfa'
const username = 'd09-mfa-user'
const userProfile = {
  username,
  firstName: 'D09',
  lastName: 'MFA',
  email: 'd09-mfa-user@example.invalid',
  emailVerified: true,
  enabled: true,
}

function readSecret(path) {
  const value = fs.readFileSync(path, 'utf8').trimEnd()
  if (!value) throw new Error(`empty secret: ${path}`)
  return value
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const adminPassword = readSecret('/run/secrets/keycloak_bootstrap_admin_password')
const userPassword = readSecret('/run/secrets/d09_mfa_user_password')
const tokenResponse = await fetch(`${origin}/realms/master/protocol/openid-connect/token`, {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'password',
    client_id: 'admin-cli',
    username: 'lab-admin',
    password: adminPassword,
  }),
  signal: AbortSignal.timeout(10_000),
})
assert(tokenResponse.ok, `admin authentication failed: HTTP ${tokenResponse.status}`)
const accessToken = (await tokenResponse.json()).access_token

async function admin(path, options = {}) {
  const headers = new Headers(options.headers)
  headers.set('authorization', `Bearer ${accessToken}`)
  if (options.body) headers.set('content-type', 'application/json')
  return fetch(`${adminApi}${path}`, { ...options, headers, signal: AbortSignal.timeout(20_000) })
}

async function json(path) {
  const response = await admin(path)
  assert(response.ok, `GET ${path} failed: HTTP ${response.status}`)
  return response.json()
}

async function success(path, options, operation) {
  const response = await admin(path, options)
  assert(response.ok, `${operation} failed: HTTP ${response.status}`)
  return response
}

let flows = await json('/authentication/flows')
let flow = flows.find((candidate) => candidate.alias === flowAlias)
if (!flow) {
  await success('/authentication/flows/browser/copy', {
    method: 'POST',
    body: JSON.stringify({ newName: flowAlias }),
  }, 'copy browser authentication flow')
  flows = await json('/authentication/flows')
  flow = flows.find((candidate) => candidate.alias === flowAlias)
}
assert(flow && flow.builtIn === false && flow.topLevel === true, 'D09 copied browser flow is invalid')

const flowExecutions = await json(`/authentication/flows/${encodeURIComponent(flowAlias)}/executions`)
assert(flowExecutions.some((item) => item.displayName === 'Username Password Form' && item.requirement === 'REQUIRED'),
  'copied flow has no required username/password form')
assert(flowExecutions.some((item) => item.authenticationFlow === true && item.requirement === 'CONDITIONAL'),
  'copied flow has no conditional 2FA sub-flow')

const clientRepresentation = {
  clientId,
  name: 'Keycloak Lab D09 MFA Diagnostic',
  enabled: true,
  protocol: 'openid-connect',
  publicClient: true,
  bearerOnly: false,
  standardFlowEnabled: true,
  implicitFlowEnabled: false,
  directAccessGrantsEnabled: false,
  serviceAccountsEnabled: false,
  redirectUris: ['https://d09-mfa.keycloak.test/callback'],
  webOrigins: [],
  attributes: { 'pkce.code.challenge.method': 'S256' },
  authenticationFlowBindingOverrides: { browser: flow.id },
}
let clients = (await json(`/clients?clientId=${clientId}`)).filter((client) => client.clientId === clientId)
assert(clients.length <= 1, `more than one ${clientId} client exists`)
if (clients.length === 0) {
  await success('/clients', { method: 'POST', body: JSON.stringify(clientRepresentation) }, 'create D09 client')
} else {
  await success(`/clients/${clients[0].id}`, {
    method: 'PUT',
    body: JSON.stringify({ ...clientRepresentation, id: clients[0].id }),
  }, 'update D09 client')
}
clients = (await json(`/clients?clientId=${clientId}`)).filter((client) => client.clientId === clientId)
assert(clients.length === 1, `expected exactly one ${clientId} client`)

let users = (await json(`/users?username=${username}&exact=true`)).filter((user) => user.username === username)
assert(users.length <= 1, `more than one ${username} exists`)
if (users.length === 0) {
  await success('/users', {
    method: 'POST',
    body: JSON.stringify({ ...userProfile, requiredActions: ['CONFIGURE_TOTP'] }),
  }, 'create D09 user')
  users = (await json(`/users?username=${username}&exact=true`)).filter((user) => user.username === username)
}
assert(users.length === 1, `expected exactly one ${username}`)
const userId = users[0].id

for (const credential of await json(`/users/${userId}/credentials`)) {
  if (credential.type === 'otp') {
    await success(`/users/${userId}/credentials/${credential.id}`, { method: 'DELETE' }, 'remove prior D09 OTP')
  }
}
await success(`/users/${userId}`, {
  method: 'PUT',
  body: JSON.stringify({ ...users[0], ...userProfile, requiredActions: ['CONFIGURE_TOTP'] }),
}, 'reset D09 required action')
await success(`/users/${userId}/reset-password`, {
  method: 'PUT',
  body: JSON.stringify({ type: 'password', value: userPassword, temporary: false }),
}, 'reset D09 password')

const realmState = await json('')
assert(realmState.otpPolicyType === 'totp', `unexpected OTP type: ${realmState.otpPolicyType}`)
assert(realmState.otpPolicyAlgorithm === 'HmacSHA1', `unexpected OTP algorithm: ${realmState.otpPolicyAlgorithm}`)
assert(realmState.otpPolicyDigits === 6, `unexpected OTP digits: ${realmState.otpPolicyDigits}`)
assert(realmState.otpPolicyPeriod === 30, `unexpected OTP period: ${realmState.otpPolicyPeriod}`)

console.log(`flow=${flowAlias}`)
console.log('flow_source=browser_copy')
console.log('username_password=REQUIRED')
console.log('conditional_2fa=CONDITIONAL')
console.log(`client=${clientId}`)
console.log('client_browser_override=true')
console.log('pkce=S256')
console.log(`user=${username}`)
console.log('required_action=CONFIGURE_TOTP')
console.log('otp_policy=totp/HmacSHA1/6/30')
