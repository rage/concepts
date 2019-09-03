import { PROJECT_BY_ID } from '../../graphql/Query'
import client from '../apolloClient'

const updateActiveTemplate= (projectId) =>
  (store, response) => {
    const dataInStore = store.readQuery({
      query: PROJECT_BY_ID,
      variables: { id: projectId }
    })
    const newActiveTemplate = response.data.setActiveTemplate.activeTemplate
    dataInStore.projectById.activeTemplate = newActiveTemplate
    client.writeQuery({
      query: PROJECT_BY_ID,
      variables: { id: projectId },
      data: dataInStore
    })
  }

export {
  updateActiveTemplate
}
