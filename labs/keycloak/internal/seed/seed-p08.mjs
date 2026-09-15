import { applyStep } from '../keycloak/apply.mjs'
import { applyLegacyDiagnostic } from '../keycloak/groups.mjs'

await applyStep('ldap')
await applyStep('groups')
await applyLegacyDiagnostic()
console.log('P08 federation, group mapping, and diagnostic seed applied')
