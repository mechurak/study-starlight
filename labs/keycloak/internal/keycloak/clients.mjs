import { createAdmin, readJson, readSecret, upsertClient } from './admin.mjs'

const configRoot = '/opt/keycloak-lab/keycloak/clients'

export async function applyClient(name) {
  const filenames = { 'app-a': 'app-a.json', 'app-b': 'app-b.json' }
  const secretFiles = {
    'app-a': '/run/secrets/app_a_client_secret',
    'app-b': '/run/secrets/app_b_client_secret',
  }
  if (!filenames[name]) throw new Error(`unsupported client step: ${name}`)
  const representation = readJson(`${configRoot}/${filenames[name]}`)
  const admin = await createAdmin()
  const client = await upsertClient(admin, representation, readSecret(secretFiles[name]))
  console.log(`client=${client.clientId},applied`)
}
