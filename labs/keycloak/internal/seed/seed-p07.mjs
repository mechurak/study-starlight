import { applyStep } from '../keycloak/apply.mjs'

await applyStep('app-b')
await applyStep('api')
console.log('P07 app B, API audience, and realm role seed applied')
