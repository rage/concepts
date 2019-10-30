import client from '../../apollo/apolloClient'
import { AUTHENTICATE_GOOGLE } from '../../graphql/Mutation'
import { GET_GOOGLE_CLIENT_ID } from '../../graphql/Query'

window._googleAuthEnabled = null
let _resolve
window._googleAuthEnabledPromise = new Promise(resolve => {
  _resolve = resolve
})
window._googleAuthEnabledPromise.resolve = _resolve

const asyncify = (fn, ...args) =>
  new Promise(resolve =>
    fn(...args, (...result) =>
      resolve(...result)))

async function waitForGoogle() {
  if (window._googleAuthEnabled !== null) {
    return window._googleAuthEnabled
  }
  return window._googleAuthEnabledPromise
}

async function init() {
  const resp = await client.query({
    query: GET_GOOGLE_CLIENT_ID
  })
  const { clientId, enabled } = resp.data.googleClientId
  if (!enabled) {
    console.log('Google login is disabled in backend, not initializing gapi.auth2')
    window._googleAuthEnabled = false
    window._googleAuthEnabledPromise.resolve(false)
    return false
  }
  // This is defined in index.html
  await window._loadGooglePlatform()
  await asyncify(window.gapi.load, 'auth2')
  window._googleAuthEnabled = clientId
  window._googleAuthEnabledPromise.resolve(clientId)
  return clientId
}

export const isEnabled = async () => Boolean(await waitForGoogle())

export async function signIn() {
  const clientId = await waitForGoogle()
  const googleResp = await asyncify(window.gapi.auth2.authorize, {
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

init().catch(err => console.error('Initializing Google login failed:', err))
