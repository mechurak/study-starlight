import crypto from 'node:crypto'
import fs from 'node:fs'

const origin = 'https://keycloak.keycloak.test:30080'
const studyRealm = 'study'
const upstreamRealm = 'd16-upstream'
const username = 'd16-upstream-user'
const idpAlias = 'upstream-oidc'
const callback = 'https://d16-broker.keycloak.test/callback'

function read(path) {
  const value = fs.readFileSync(path, 'utf8').trimEnd()
  if (!value) throw new Error(`empty secret: ${path}`)
  return value
}
function assert(condition, message) {
  if (!condition) throw new Error(message)
}
function decode(value) {
  return value.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'")
}
function formAction(html) {
  const form = (html.match(/<form\b[^>]*>/gi) ?? []).find((tag) => /\bid=["']kc-form-login["']/i.test(tag))
  const action = form?.match(/\baction=["']([^"']+)["']/i)?.[1]
  if (!action) throw new Error('upstream login form action was not found')
  return decode(action)
}
function cookies(response, jar) {
  for (const cookie of response.headers.getSetCookie()) {
    const parts = cookie.split(';').map((part) => part.trim())
    const pair = parts[0]
    const index = pair.indexOf('=')
    if (index <= 0) continue
    const name = pair.slice(0, index)
    const value = pair.slice(index + 1)
    const path = parts.find((part) => part.toLowerCase().startsWith('path='))?.slice(5) ?? '/'
    const existing = jar.findIndex((item) => item.name === name && item.path === path)
    const item = { name, value, path }
    if (existing >= 0) jar[existing] = item
    else jar.push(item)
  }
}
async function request(url, jar, options = {}) {
  const headers = new Headers(options.headers)
  const pathname = new URL(url).pathname
  const cookieHeader = jar.filter((item) => pathname.startsWith(item.path))
    .map((item) => `${item.name}=${item.value}`).join('; ')
  if (cookieHeader) headers.set('cookie', cookieHeader)
  const response = await fetch(url, { ...options, headers, redirect: 'manual', signal: AbortSignal.timeout(10_000) })
  cookies(response, jar)
  return response
}
function authorizationUrl() {
  const verifier = crypto.randomBytes(32).toString('base64url')
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url')
  return `${origin}/realms/${studyRealm}/protocol/openid-connect/auth?${new URLSearchParams({
    client_id: 'd16-broker-diagnostic',
    redirect_uri: callback,
    response_type: 'code',
    scope: 'openid',
    state: crypto.randomBytes(16).toString('hex'),
    nonce: crypto.randomBytes(16).toString('hex'),
    code_challenge: challenge,
    code_challenge_method: 'S256',
    kc_idp_hint: idpAlias,
    prompt: 'login',
  })}`
}
async function upstreamLoginPage(jar) {
  let response = await request(authorizationUrl(), jar)
  for (let index = 0; index < 6; index += 1) {
    if (response.status === 200) {
      const html = await response.text()
      assert(html.includes('id="kc-form-login"'), 'redirect chain did not reach an upstream login form')
      return html
    }
    const location = response.headers.get('location')
    assert([302, 303].includes(response.status) && location?.startsWith(origin), `unexpected broker redirect: HTTP ${response.status}`)
    response = await request(location, jar)
  }
  throw new Error('too many redirects before upstream login')
}
async function followToCallback(response, jar) {
  for (let index = 0; index < 10; index += 1) {
    const location = response.headers.get('location')
    assert([302, 303].includes(response.status) && location, `broker response did not redirect: HTTP ${response.status}`)
    if (location.startsWith(callback)) return location
    assert(location.startsWith(origin), `broker redirected outside the lab: ${new URL(location).origin}`)
    response = await request(location, jar)
    if (response.status === 200) {
      const html = await response.text()
      throw new Error(`first broker login stopped on an interactive page: ${html.includes('kc-form-login') ? 'login' : 'other'}`)
    }
  }
  throw new Error('too many redirects after upstream login')
}
async function brokerLogin(password) {
  const jar = []
  const html = await upstreamLoginPage(jar)
  const response = await request(formAction(html), jar, {
    method: 'POST',
    body: new URLSearchParams({ username, password, credentialId: '' }),
  })
  return { jar, response }
}
async function adminToken() {
  const response = await fetch(`${origin}/realms/master/protocol/openid-connect/token`, {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'password', client_id: 'admin-cli', username: 'lab-admin', password: adminPassword }),
  })
  assert(response.ok, `admin login failed: HTTP ${response.status}`)
  return (await response.json()).access_token
}
async function adminGet(token, path) {
  const response = await fetch(`${origin}/admin/realms/${studyRealm}${path}`, {
    headers: { authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(10_000),
  })
  assert(response.ok, `admin GET ${path} failed: HTTP ${response.status}`)
  return response.json()
}

const password = read('/run/secrets/d16_upstream_user_password')
const adminPassword = read('/run/secrets/keycloak_bootstrap_admin_password')

const wrong = await brokerLogin('not-the-upstream-password')
assert(wrong.response.status === 200, `wrong upstream password was not rejected: HTTP ${wrong.response.status}`)
assert((await wrong.response.text()).includes('id="kc-form-login"'), 'wrong upstream password left the login form')

const first = await brokerLogin(password)
await followToCallback(first.response, first.jar)

const token = await adminToken()
let users = (await adminGet(token, `/users?username=${username}&exact=true`)).filter((user) => user.username === username)
assert(users.length === 1, `first broker login created ${users.length} local users`)
const firstUserId = users[0].id
let links = await adminGet(token, `/users/${firstUserId}/federated-identity`)
assert(links.length === 1 && links[0].identityProvider === idpAlias, 'first broker identity link is missing')

const second = await brokerLogin(password)
await followToCallback(second.response, second.jar)
users = (await adminGet(token, `/users?username=${username}&exact=true`)).filter((user) => user.username === username)
assert(users.length === 1 && users[0].id === firstUserId, 'second broker login did not reuse the linked user')
links = await adminGet(token, `/users/${firstUserId}/federated-identity`)
assert(links.length === 1 && links[0].identityProvider === idpAlias, 'second login changed the broker link')

console.log(`upstream_issuer=${origin}/realms/${upstreamRealm}`)
console.log('wrong_upstream_password=rejected')
console.log('first_broker_login=callback')
console.log('local_user_created=1')
console.log(`federated_identity=${idpAlias}`)
console.log('second_broker_login=reused_link')
