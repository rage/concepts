let metadata, client

try {
  metadata = require('../../google/credentials')

  const google = require('google-auth-library')
  client = new google.OAuth2Client(metadata.client_id, metadata.client_secret)
} catch (err) {
  console.error('Google auth credentials not set')
  metadata = null
}

export async function verify(token) {
  if (!metadata) {
    return null
  }
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: metadata.web.client_id
    })
    return ticket.getPayload()
  } catch {
    return null
  }
}

export const getClientId = () => metadata ? {
  enabled: true,
  clientId: metadata.web.client_id
} : { enabled: false }
