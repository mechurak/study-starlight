import crypto from 'node:crypto'
import fs from 'node:fs'

const origin = 'https://keycloak.keycloak.test:30080'
const issuer = `${origin}/realms/study`
const adminApi = `${origin}/admin/realms/study`
const clientId = 'd09-mfa'
const redirectUri = 'https://d09-mfa.keycloak.test/callback'
const username = 'd09-mfa-user'

function readSecret(path) {
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
function inputValue(html, name) {
  const input = (html.match(/<input\b[^>]*>/gi) ?? []).find((tag) => new RegExp(`\\bname=["']${name}["']`, 'i').test(tag))
  const value = input?.match(/\bvalue=["']([^"']*)["']/i)?.[1]
  if (value === undefined) throw new Error(`input ${name} was not found`)
  return decode(value)
}
function formAction(html, id) {
  const form = (html.match(/<form\b[^>]*>/gi) ?? []).find((tag) => new RegExp(`\\bid=["']${id}["']`, 'i').test(tag))
  const action = form?.match(/\baction=["']([^"']+)["']/i)?.[1]
  if (!action) throw new Error(`form ${id} was not found`)
  return decode(action)
}
function elementText(html, id) {
  const match = html.match(new RegExp(`<[^>]+id=["']${id}["'][^>]*>([\\s\\S]*?)<\\/[^>]+>`, 'i'))
  if (!match) throw new Error(`element ${id} was not found`)
  return decode(match[1].replace(/<[^>]+>/g, '').trim())
}
function linkHref(html, id) {
  const link = (html.match(/<a\b[^>]*>/gi) ?? []).find((tag) => new RegExp(`\\bid=["']${id}["']`, 'i').test(tag))
  const href = link?.match(/\bhref=["']([^"']+)["']/i)?.[1]
  if (!href) throw new Error(`link ${id} was not found`)
  return decode(href)
}
function storeCookies(response, jar) {
  for (const cookie of response.headers.getSetCookie()) {
    const pair = cookie.split(';', 1)[0]
    const separator = pair.indexOf('=')
    if (separator > 0) jar.set(pair.slice(0, separator), pair.slice(separator + 1))
  }
}
async function request(url, jar, options = {}) {
  const headers = new Headers(options.headers)
  if (jar.size) headers.set('cookie', [...jar].map(([key, value]) => `${key}=${value}`).join('; '))
  const response = await fetch(url, { ...options, headers, redirect: 'manual', signal: AbortSignal.timeout(10_000) })
  storeCookies(response, jar)
  return response
}
function base32Decode(value) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let bits = ''
  for (const character of value.toUpperCase().replaceAll('=', '').replaceAll(' ', '')) {
    const index = alphabet.indexOf(character)
    assert(index >= 0, 'OTP secret contains a non-base32 character')
    bits += index.toString(2).padStart(5, '0')
  }
  const bytes = []
  for (let offset = 0; offset + 8 <= bits.length; offset += 8) bytes.push(Number.parseInt(bits.slice(offset, offset + 8), 2))
  return Buffer.from(bytes)
}
function totp(secret, epochSeconds = Math.floor(Date.now() / 1000)) {
  const counter = Math.floor(epochSeconds / 30)
  const buffer = Buffer.alloc(8)
  buffer.writeBigUInt64BE(BigInt(counter))
  const digest = crypto.createHmac('sha1', base32Decode(secret)).update(buffer).digest()
  const offset = digest[digest.length - 1] & 0x0f
  const binary = (digest.readUInt32BE(offset) & 0x7fffffff) % 1_000_000
  return binary.toString().padStart(6, '0')
}
function authUrl() {
  const verifier = crypto.randomBytes(32).toString('base64url')
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url')
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid',
    state: crypto.randomBytes(16).toString('hex'),
    nonce: crypto.randomBytes(16).toString('hex'),
    code_challenge: challenge,
    code_challenge_method: 'S256',
    prompt: 'login',
  })
  return `${issuer}/protocol/openid-connect/auth?${params}`
}
async function passwordStep(jar) {
  const page = await request(authUrl(), jar)
  assert(page.status === 200, `login page failed: HTTP ${page.status}`)
  const html = await page.text()
  const response = await request(formAction(html, 'kc-form-login'), jar, {
    method: 'POST',
    body: new URLSearchParams({ username, password: userPassword, credentialId: '' }),
  })
  if (response.status === 200) return response.text()
  const location = response.headers.get('location')
  assert(response.status === 302 && location?.startsWith(origin),
    `password step did not lead to a Keycloak MFA page: HTTP ${response.status}`)
  const redirected = await request(location, jar)
  assert(redirected.status === 200, `MFA redirect failed: HTTP ${redirected.status}`)
  return redirected.text()
}
async function enroll(jar, html, label) {
  assert(html.includes('id="kc-totp-settings-form"'), 'Configure OTP required action was not shown')
  const manualResponse = await request(linkHref(html, 'mode-manual'), jar)
  assert(manualResponse.status === 200, `manual OTP setup page failed: HTTP ${manualResponse.status}`)
  const manualHtml = await manualResponse.text()
  const encodedSecret = elementText(manualHtml, 'kc-totp-secret-key')
  const submittedSecret = inputValue(manualHtml, 'totpSecret')
  const response = await request(formAction(manualHtml, 'kc-totp-settings-form'), jar, {
    method: 'POST',
    body: new URLSearchParams({
      totp: totp(encodedSecret),
      totpSecret: submittedSecret,
      mode: 'manual',
      userLabel: label,
    }),
  })
  if (response.status !== 302 || !response.headers.get('location')?.startsWith(redirectUri)) {
    const responseHtml = await response.text()
    const error = responseHtml.match(/id=["']input-error-(?:otp-code|otp-label)["'][^>]*>([\s\S]*?)<\/span>/i)?.[1]
      ?? responseHtml.match(/class=["'][^"']*alert-error[^"']*["'][^>]*>([\s\S]*?)<\/[^>]+>/i)?.[1]
      ?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    const marker = responseHtml.includes('id="kc-totp-settings-form"') ? 'configure-form' : 'other-page'
    const title = responseHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
      ?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    const ids = ['kc-error-message', 'kc-info-message', 'kc-form-login', 'kc-otp-login-form', 'kc-totp-settings-form']
      .filter((id) => responseHtml.includes(`id="${id}"`)).join(',')
    const heading = responseHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]
      ?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    throw new Error(`OTP enrollment did not complete: HTTP ${response.status}; page=${marker}; title=${title ?? 'unknown'}; heading=${heading ?? 'unknown'}; ids=${ids || 'none'}; error=${error ?? 'unknown'}`)
  }
  return encodedSecret
}

async function waitForNextPeriod() {
  const seconds = Math.floor(Date.now() / 1000)
  const waitMilliseconds = (30 - (seconds % 30) + 1) * 1000
  await new Promise((resolve) => setTimeout(resolve, waitMilliseconds))
}

async function adminAccessToken() {
  const response = await fetch(`${origin}/realms/master/protocol/openid-connect/token`, {
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
  assert(response.ok, `admin authentication failed: HTTP ${response.status}`)
  return (await response.json()).access_token
}

async function adminRequest(token, path, options = {}) {
  const headers = new Headers(options.headers)
  headers.set('authorization', `Bearer ${token}`)
  if (options.body) headers.set('content-type', 'application/json')
  return fetch(`${adminApi}${path}`, { ...options, headers, signal: AbortSignal.timeout(10_000) })
}

const userPassword = readSecret('/run/secrets/d09_mfa_user_password')
const adminPassword = readSecret('/run/secrets/keycloak_bootstrap_admin_password')

const enrollmentJar = new Map()
const firstSecret = await enroll(enrollmentJar, await passwordStep(enrollmentJar), 'D09 diagnostic')
await waitForNextPeriod()

const failureJar = new Map()
const otpPage = await passwordStep(failureJar)
assert(otpPage.includes('id="kc-otp-login-form"'), 'OTP login form was not shown after enrollment')
const correct = totp(firstSecret)
const wrong = ((Number(correct) + 1) % 1_000_000).toString().padStart(6, '0')
const wrongResponse = await request(formAction(otpPage, 'kc-otp-login-form'), failureJar, {
  method: 'POST',
  body: new URLSearchParams({ otp: wrong }),
})
assert(wrongResponse.status === 200, `wrong OTP was not rejected: HTTP ${wrongResponse.status}`)
const retryPage = await wrongResponse.text()
assert(retryPage.includes('id="kc-otp-login-form"') && !retryPage.includes(redirectUri),
  'wrong OTP unexpectedly left the OTP form')

const successResponse = await request(formAction(retryPage, 'kc-otp-login-form'), failureJar, {
  method: 'POST',
  body: new URLSearchParams({ otp: totp(firstSecret) }),
})
assert(successResponse.status === 302 && successResponse.headers.get('location')?.startsWith(redirectUri),
  `correct OTP did not complete login: HTTP ${successResponse.status}`)

const token = await adminAccessToken()
const usersResponse = await adminRequest(token, `/users?username=${username}&exact=true`)
assert(usersResponse.ok, `query D09 user failed: HTTP ${usersResponse.status}`)
const users = (await usersResponse.json()).filter((user) => user.username === username)
assert(users.length === 1, `expected exactly one ${username}`)
const user = users[0]
const credentialsResponse = await adminRequest(token, `/users/${user.id}/credentials`)
assert(credentialsResponse.ok, `query D09 credentials failed: HTTP ${credentialsResponse.status}`)
const otpCredentials = (await credentialsResponse.json()).filter((credential) => credential.type === 'otp')
assert(otpCredentials.length === 1, `expected one OTP credential, found ${otpCredentials.length}`)
const deleteResponse = await adminRequest(token, `/users/${user.id}/credentials/${otpCredentials[0].id}`, { method: 'DELETE' })
assert(deleteResponse.ok, `delete lost OTP credential failed: HTTP ${deleteResponse.status}`)
const updateResponse = await adminRequest(token, `/users/${user.id}`, {
  method: 'PUT',
  body: JSON.stringify({ ...user, requiredActions: ['CONFIGURE_TOTP'] }),
})
assert(updateResponse.ok, `restore CONFIGURE_TOTP action failed: HTTP ${updateResponse.status}`)

const recoveryJar = new Map()
const recoveryPage = await passwordStep(recoveryJar)
assert(recoveryPage.includes('id="kc-totp-settings-form"'), 'recovery did not return to OTP enrollment')
await enroll(recoveryJar, recoveryPage, 'D09 recovered')

const finalCredentialsResponse = await adminRequest(token, `/users/${user.id}/credentials`)
assert(finalCredentialsResponse.ok, `query recovered credentials failed: HTTP ${finalCredentialsResponse.status}`)
const finalOtp = (await finalCredentialsResponse.json()).filter((credential) => credential.type === 'otp')
assert(finalOtp.length === 1, `recovery did not leave exactly one OTP credential: ${finalOtp.length}`)
const finalUserResponse = await adminRequest(token, `/users/${user.id}`)
assert(finalUserResponse.ok, `query recovered user failed: HTTP ${finalUserResponse.status}`)
assert(!(await finalUserResponse.json()).requiredActions.includes('CONFIGURE_TOTP'),
  'CONFIGURE_TOTP required action remained after recovery')

console.log('first_login=configure_otp_then_callback')
console.log('wrong_otp=rejected')
console.log('correct_password_and_otp=callback')
console.log('recovery=delete_credential_require_reenrollment')
console.log('recovery_login=configure_otp_then_callback')
console.log('final_otp_credentials=1')
