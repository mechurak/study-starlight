import fs from 'node:fs'
import https from 'node:https'

import express from 'express'
import session from 'express-session'
import * as oidc from 'openid-client'

function requiredEnvironment(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} is required`)
  }
  return value
}

function readSecret(name, filename) {
  const value = fs.readFileSync(filename, 'utf8').trimEnd()
  if (!value) {
    throw new Error(`${name} is empty`)
  }
  return value
}

function saveSession(request) {
  return new Promise((resolve, reject) => {
    request.session.save((error) => (error ? reject(error) : resolve()))
  })
}

const appName = requiredEnvironment('APP_NAME')
const appOrigin = new URL(requiredEnvironment('APP_ORIGIN'))
const callbackUrl = new URL('/callback', appOrigin)
const issuer = new URL(requiredEnvironment('OIDC_ISSUER'))
const clientId = requiredEnvironment('OIDC_CLIENT_ID')
const port = Number(requiredEnvironment('APP_PORT'))

const clientSecret = readSecret(
  'OIDC client secret',
  '/run/secrets/app_a_client_secret',
)
const sessionSecret = readSecret(
  'session secret',
  '/run/secrets/app_a_session_secret',
)

const oidcConfiguration = await oidc.discovery(issuer, clientId, clientSecret)

const app = express()
app.disable('x-powered-by')
app.use(
  session({
    name: 'app-a.sid',
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
    },
  }),
)

app.get('/healthz', (_request, response) => {
  response.type('text/plain').send('ok')
})

app.get('/', (request, response) => {
  const user = request.session.user
  response.type('html').send(`<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><title>${appName}</title></head>
  <body>
    <h1>${appName}</h1>
    <p>${user ? `Signed in as ${user.username}` : 'Signed out'}</p>
    ${user ? '' : '<a href="/login">Sign in with Keycloak</a>'}
  </body>
</html>`)
})

app.get('/session', (request, response) => {
  const user = request.session.user
  response.json(
    user
      ? { authenticated: true, subject: user.subject, username: user.username }
      : { authenticated: false },
  )
})

app.get('/login', async (request, response, next) => {
  try {
    const codeVerifier = oidc.randomPKCECodeVerifier()
    const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier)
    const state = oidc.randomState()
    const nonce = oidc.randomNonce()

    request.session.oidcTransaction = { codeVerifier, state, nonce }
    await saveSession(request)

    const authorizationUrl = oidc.buildAuthorizationUrl(oidcConfiguration, {
      redirect_uri: callbackUrl.href,
      response_type: 'code',
      scope: 'openid profile email',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state,
      nonce,
    })

    response.redirect(authorizationUrl.href)
  } catch (error) {
    next(error)
  }
})

app.get('/callback', async (request, response) => {
  const transaction = request.session.oidcTransaction
  delete request.session.oidcTransaction

  if (!transaction) {
    response.status(400).type('text/plain').send('OIDC login failed')
    return
  }

  try {
    const currentUrl = new URL(request.originalUrl, callbackUrl)
    const tokens = await oidc.authorizationCodeGrant(
      oidcConfiguration,
      currentUrl,
      {
        pkceCodeVerifier: transaction.codeVerifier,
        expectedState: transaction.state,
        expectedNonce: transaction.nonce,
        idTokenExpected: true,
      },
    )
    const claims = tokens.claims()

    if (!claims?.sub) {
      throw new Error('validated ID Token has no subject')
    }

    request.session.user = {
      subject: claims.sub,
      username: claims.preferred_username ?? claims.sub,
    }
    await saveSession(request)
    response.redirect('/')
  } catch (error) {
    const errorName = error?.code ?? error?.name ?? 'Error'
    console.warn(`OIDC callback rejected: ${errorName}`)
    response.status(400).type('text/plain').send('OIDC login failed')
  }
})

app.use((error, _request, response, _next) => {
  console.error(`application request failed: ${error?.name ?? 'Error'}`)
  response.status(500).type('text/plain').send('Application error')
})

const server = https.createServer(
  {
    cert: fs.readFileSync('/run/keycloak-lab/certs/app-a.crt'),
    key: fs.readFileSync('/run/secrets/app_a_https_key'),
  },
  app,
)

server.listen(port, '0.0.0.0', () => {
  console.log(`${appName} listening at ${appOrigin.href}`)
})
