import { OAuth2Client } from 'google-auth-library'
let metadata, client

const init = async () => {
  try {
    metadata = await import('../../google/credentials')
    client = new OAuth2Client(metadata.client_id, metadata.client_secret)
  } catch (err) {
    console.error('Google auth credentials not set')
    metadata = null
  }
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

init()
