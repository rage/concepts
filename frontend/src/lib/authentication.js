import TmcClient from 'tmc-client-js'
import axios from 'axios'
import client from '../apolloClient'
import { gql } from 'apollo-boost'

const clientId = process.env.REACT_APP_TMC_CLIENT_ID
const tmcSecret = process.env.REACT_APP_TMC_SECRET
const tmcClient = new TmcClient(clientId, tmcSecret)

export const getUser = () => tmcClient.getUser()

export const isSignedIn = () => {
  return window.localStorage.getItem('current_user') !== null
}

export const isAdmin = () => {
}

export const signIn = async ({
  email,
  password,
}) => {
  const res = await tmcClient.authenticate({ username: email, password })
  const apiResponse = await apiAuthentication(res.accessToken)
  window.localStorage.setItem('current_user', JSON.stringify(apiResponse.data.login))
  return apiResponse
}

export const signOut = async (apollo) => {
  await apollo.resetStore().then(() => {
    tmcClient.unauthenticate()
    window.localStorage.clear()
  })
}

export async function apiAuthentication(accessToken) {
  const res = client.mutate({
    mutation: gql`
      mutation authenticateUser($tmcToken: String!) {
        login(tmcToken: $tmcToken) {
          token
          user {
            id
            role
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