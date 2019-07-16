import { UPDATE_USER } from '../graphql/Mutation'
import { USER_BY_ID } from '../graphql/Query'
import client from '../apollo/apolloClient'

export const setProgress = async (index, userId) => {
  try {
    const response = await updateUser({
      variables: { id: userId, guideProgress: index }
    })
    const currentUser = JSON.parse(localStorage.getItem('current_user'))
    const newUser = currentUser.user
    newUser.guideProgress = index
    localStorage.setItem('current_user', JSON.stringify(currentUser))
    return response.data.updateUser
  } catch (error) {
    return
  }
}

export const getProgress = async (userId) => {
  try {
    const response = await getUser({
      variables: { id: userId }
    })
    return response.data.userById.guideProgress
  } catch (error) {
    return
  }
}

const getUser = async ({ variables }) => {
  return await client.query({
    query: USER_BY_ID,
    variables
  })
}

const updateUser = async ({ variables }) => {
  return await client.mutate({
    mutation: UPDATE_USER, variables
  })
}
