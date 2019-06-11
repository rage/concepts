import tmcClient from 'tmc-client-js'
import axios from 'axios'

const clientId = process.env.REACT_APP_TMC_CLIENT_ID
const tmcSecret = process.env.REACT_APP_TMC_SECRET
const client = new tmcClient(clientId, tmcSecret)

export const getUser = () => client.getUser()

export const isSignedIn = () => {
  return window.localStorage.getItem('access_token') !== null
}

export const isAdmin = () => {
}

export const signIn = async ({
  email,
  password,
}) => {
  const res = await client.authenticate({ username: email, password })
  const apiResponse = await apiAuthentication(res.accessToken)
  console.log(apiResponse.data.login)
  window.localStorage.setItem('acces_token', apiResponse.data.login)
  return apiResponse
}

export const signOut = async (apollo) => {
  await apollo.resetStore().then(() => {
    client.unauthenticate()
  })
}

export async function apiAuthentication(accessToken) {
  const data = {
    query: `
      mutation authenticateUser {
        login(tmcToken: ${accessToken}) {
          token
          user {
            id
            role
          }
        }
      }
    `
  }
  const res = await axios.post('/grapql', data)
  return res.data
}

export async function userDetails(accessToken) {
  const res = await axios.get(
    `https://tmc.mooc.fi/api/v8/users/current?show_user_fields=true`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )
  return res.data
}