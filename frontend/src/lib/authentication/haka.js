// eslint-disable-next-line no-undef
const HAKA_URL = process.env.REACT_APP_HAKA_URL

export const isEnabled = () => Boolean(HAKA_URL)

export const signInURL = HAKA_URL

export function signIn() {
  window.location.href = HAKA_URL
}

export function signOut() {
  // TODO Single-Sign-Out
}
