import client from '../../apollo/apolloClient'
import { CREATE_GUEST_ACCOUNT } from '../../graphql/Mutation'

export const isEnabled = () => true

export async function signIn() {
  const result = await client.mutate({
    mutation: CREATE_GUEST_ACCOUNT
  })
  const data = result.data.createGuest
  data.type = 'GUEST'
  return data
}

export function signOut() {}
