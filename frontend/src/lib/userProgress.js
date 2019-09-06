import { UPDATE_USER } from '../graphql/Mutation'
import client from '../apollo/apolloClient'

export const setProgress = async (index, userId) => {
  try {
    const response = await updateUser({
      variables: { id: userId, guideProgress: index }
    })
    const currentUser = JSON.parse(window.localStorage.currentUser)
    const newUser = currentUser.user
    newUser.guideProgress = response.data.updateUser.guideProgress
    window.localStorage.currentUser = JSON.stringify(currentUser)
    return response.data.updateUser
  } catch (error) {}
}

export const getUser = () => {
  const local = JSON.parse(window.localStorage.currentUser)
  return local && local.user
}

const updateUser = ({ variables }) => client.mutate({
  mutation: UPDATE_USER, variables
})
