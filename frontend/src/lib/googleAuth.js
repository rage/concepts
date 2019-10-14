/* global gapi */

import client from '../apollo/apolloClient'
import { AUTHENTICATE_GOOGLE } from '../graphql/Mutation'
import { GET_GOOGLE_CLIENT_ID } from '../graphql/Query'

window._googleAuthEnabled = null
window._googleAuthEnabledPromise = null

const asyncify = (fn, ...args) =>
  new Promise(resolve =>
    fn(...args, (...result) =>
      resolve(...result)))

export async function init() {
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
  await gapi.auth2.init({
    // eslint-disable-next-line camelcase
    client_id: clientId
  })
  return true
}

export async function signedIn(user) {
  const resp = await client.mutate({
    mutation: AUTHENTICATE_GOOGLE,
    variables: { idToken: user.getAuthResponse().id_token }
  })
  const data = resp.data.loginGoogle
  if (data.user) {
    data.user.username = user.getBasicProfile().getName()
  }
  data.type = 'GOOGLE'
  window.localStorage.currentUser = JSON.stringify(data)
  return data
}

export async function signOut() {
  if (!window._googleAuthEnabled) {
    return false
  }
  const auth2 = gapi.auth2.getAuthInstance()
  await auth2.signOut()
  return true
}

if (window.google_inited) {
  init()
} else {
  // eslint-disable-next-line camelcase
  window._concepts_google_init = init
}
