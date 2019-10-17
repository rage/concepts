/* global gapi */

import client from '../../apollo/apolloClient'
import { AUTHENTICATE_GOOGLE } from '../../graphql/Mutation'
import { GET_GOOGLE_CLIENT_ID } from '../../graphql/Query'

window._googleAuthEnabled = null
window._googleAuthEnabledPromise = null

const asyncify = (fn, ...args) =>
  new Promise(resolve =>
    fn(...args, (...result) =>
      resolve(...result)))

async function init() {
  if (window._googleAuthEnabled !== null) {
    return window._googleAuthEnabled
  } else if (!window._googleAuthEnabledPromise) {
    window._googleAuthEnabledPromise = new Promise(resolve => {
      const result = actuallyInit()
      window._googleAuthEnabled = result
      resolve(result)
    })
  }
  return window._googleAuthEnabledPromise
}

async function actuallyInit() {
  const resp = await client.query({
    query: GET_GOOGLE_CLIENT_ID
  })
  const { clientId, enabled } = resp.data.googleClientId
  if (!enabled) {
    console.log('Google login is disabled in backend, not initializing gapi.auth2')
    return false
  }
  await asyncify(gapi.load, 'auth2')
  return clientId
}

export const isEnabled = async () => Boolean(await init())

export async function signIn() {
  const clientId = await init()
  const googleResp = await asyncify(gapi.auth2.authorize, {
    // eslint-disable-next-line camelcase
    client_id: clientId,
    // eslint-disable-next-line camelcase
    response_type: 'id_token permission',
    scope: 'email profile openid'
  })
  if (googleResp.error) {
    throw new Error(googleResp.error)
  }
  const backendResp = await client.mutate({
    mutation: AUTHENTICATE_GOOGLE,
    variables: { idToken: googleResp.id_token }
  })

  const data = backendResp.data.loginGoogle

  try {
    const userDataResp = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
      headers: {
        Authorization: `${googleResp.token_type} ${googleResp.access_token}`
      }
    })
    const userData = await userDataResp.json()
    data.displayname = userData.name || userData.email
    window.localStorage['google.user'] = JSON.stringify(userData)
  } catch (err) {
    console.error('Failed to fetch Google profile info:', err)
  }
  data.type = 'GOOGLE'
  return data
}

export async function signOut() {
  // I think we don't need to do anything here
}

if (window.google_inited) {
  init()
} else {
  // eslint-disable-next-line camelcase
  window._concepts_google_init = init
}
