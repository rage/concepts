import { UPDATE_USER } from '../graphql/Mutation'
import client from '../apollo/apolloClient'

export const setProgress = async (index, userId) => {
  try {
    const response = await updateUser({
      variables: { id: userId, guideProgress: index }
    })
    const currentUser = JSON.parse(localStorage.getItem('current_user'))
    const newUser = currentUser.user
    newUser.guideProgress = response.data.updateUser.guideProgress
    localStorage.setItem('current_user', JSON.stringify(currentUser))
    return response.data.updateUser
  } catch (error) {}
}

export const getUser = () => {
  const local = JSON.parse(localStorage.getItem('current_user'))
  return local && local.user
}

const updateUser = async ({ variables }) => {
  return await client.mutate({
    mutation: UPDATE_USER, variables
  })
}
