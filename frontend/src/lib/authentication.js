import TmcClient from 'tmc-client-js'
import axios from 'axios'
import client from '../apollo/apolloClient'
import { gql } from 'apollo-boost'

const clientId = 'd985b05c840a5474ccbbd78a2039397c4764aad96f2ec3e4a551be408a987d5a'
const tmcSecret = '8d30681d6f72f2dd45ee74fd3556f2e97bd28dea6f2d4ac2358b69738de1229b'
const tmcClient = new TmcClient(clientId, tmcSecret)

export const getUser = () => tmcClient.getUser()

export const isSignedIn = () => {
  return window.localStorage.getItem('current_user') !== null
}

export const isAdmin = () => {
}

export const signIn = async ({
  email,
  password
}) => {
  const res = await tmcClient.authenticate({ username: email, password })
  const apiResponse = await apiAuthentication(res.accessToken)
  await window.localStorage.setItem('current_user', JSON.stringify(apiResponse.data.login))
  return apiResponse.data.login
}

export const signOut = async () => {
  await client.resetStore().then(() => {
    tmcClient.unauthenticate()
    window.localStorage.clear()
  })
}

export async function apiAuthentication(accessToken) {
  const res = await client.mutate({
    mutation: gql`
      mutation authenticateUser($tmcToken: String!) {
        login(tmcToken: $tmcToken) {
          token
          user {
            id
            role
            guideProgress
          }
        }
      }
    `
    , variables: { tmcToken: accessToken }
  })
  return res
}

export async function userDetails(accessToken) {
  const res = await axios.get(
    'https://tmc.mooc.fi/api/v8/users/current?show_user_fields=true',
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    },
  )
  return res.data
}
