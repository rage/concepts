import client from '../../apollo/apolloClient'
import { GET_HAKA_LOGIN_URL } from '../../graphql/Query'

window._hakaAuthEnabled = null
let _resolve
window._hakaAuthEnabledPromise = new Promise(resolve => {
  _resolve = resolve
})
window._hakaAuthEnabledPromise.resolve = _resolve

async function waitForHaka() {
  if (window._hakaAuthEnabled !== null) {
    return window._hakaAuthEnabled
  }
  return window._hakaAuthEnabledPromise
}

async function init() {
  const resp = await client.query({
    query: GET_HAKA_LOGIN_URL
  })
  const { url, enabled } = resp.data.hakaLoginUrl
  if (!enabled) {
    console.log('Haka login is disabled in backend')
    window._hakaAuthEnabled = false
    window._hakaAuthEnabledPromise.resolve(false)
    return
  }
  window._hakaAuthEnabled = url
  window._hakaAuthEnabledPromise.resolve(url)
}

export const isEnabled = async () => Boolean(await waitForHaka())

export const getSignInURL = () => window._hakaAuthEnabled

export async function signIn() {
  await waitForHaka()
  if (window._hakaAuthEnabled) {
    window.location.href = window._hakaAuthEnabled
  }
}

export function signOut() {
  // TODO Single-Sign-Out
}

init().catch(err => console.error('Initializing Haka login failed:', err))
