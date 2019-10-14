let metadata, client

try {
  metadata = require('../../google/credentials')

  const google = require('google-auth-library')
  client = new google.OAuth2Client(metadata.client_id)

  console.log('Google login enabled:', metadata)
} catch (err) {
  console.error('Not enabling Google login:', err)
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
    const payload = ticket.getPayload()
    console.log(payload)
    return payload.sub
  } catch {
    return null
  }
}

export const getGoogleLoginAPI = (req, res) =>
  res.json(!metadata ? { enabled: false } : {
    enabled: true,
    // eslint-disable-next-line camelcase
    client_id: metadata.web.client_id
  })

export const postGoogleLoginAPI = async (req, res) => {
  if (!metadata) {
    return res.json({ enabled: false })
  }
  console.log(req)
}
