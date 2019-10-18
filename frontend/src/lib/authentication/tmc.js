import TmcClient from 'tmc-client-js'

import client from '../../apollo/apolloClient'
import { AUTHENTICATE } from '../../graphql/Mutation'

const clientId = 'd985b05c840a5474ccbbd78a2039397c4764aad96f2ec3e4a551be408a987d5a'
const clientSecret = '8d30681d6f72f2dd45ee74fd3556f2e97bd28dea6f2d4ac2358b69738de1229b'
const tmcClient = new TmcClient(clientId, clientSecret)

export const isEnabled = () => Boolean(clientId && clientSecret && tmcClient)

export async function signIn({ email, password }) {
  const res = await tmcClient.authenticate({ username: email, password })
  const apiResponse = await client.mutate({
    mutation: AUTHENTICATE,
    variables: { tmcToken: res.accessToken }
  })
  const data = apiResponse.data.login
  if (data.user) {
    data.displayname = res.username
  }
  data.type = 'TMC'
  return data
}

export async function userDetails(accessToken) {
  const res = await fetch(
    'https://tmc.mooc.fi/api/v8/users/current?show_user_fields=true',
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    }
  )
  return await res.json()
}

export async function signOut() {
  tmcClient.unauthenticate()
}
