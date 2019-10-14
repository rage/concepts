/* global gapi */

import client from '../apollo/apolloClient'
import { AUTHENTICATE_GOOGLE } from '../graphql/Mutation'

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
  const resp = await fetch('/api/login/google')
  const data = await resp.json()
  if (!data.enabled) {
    console.log('Google login is disabled in backend, not initializing gapi.auth2')
    return false
  }
  delete data.enabled
  await asyncify(gapi.load, 'auth2')
  await gapi.auth2.init(data)
  return true
}

export async function signedIn(user) {
  const profile = user.getBasicProfile()
  console.log(profile)
  console.log('ID: ' + profile.getId())
  console.log('Name: ' + profile.getName())
  console.log('Image URL: ' + profile.getImageUrl())
  console.log('Email: ' + profile.getEmail())
  const idToken = user.getAuthResponse().id_token
  console.log(idToken)
  //await apiAuthentication(idToken)
}

export async function apiAuthentication(idToken) {
  return await client.mutate({
    mutation: AUTHENTICATE_GOOGLE,
    variables: { idToken }
  })
}

if (window.google_inited) {
  init()
} else {
  // eslint-disable-next-line camelcase
  window._concepts_google_init = init
}

// eslint-disable-next-line camelcase
window._concepts_google_signed_in = signedIn
