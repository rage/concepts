import { PROJECT_BY_ID } from '../../graphql/Query'
import client from '../apolloClient'

const updateActiveTemplate = (projectId) =>
  (store, response) => {
    const dataInStore = store.readQuery({
      query: PROJECT_BY_ID,
      variables: { id: projectId }
    })
    dataInStore.projectById.activeTemplate = response.data.setActiveTemplate.activeTemplate
    client.writeQuery({
      query: PROJECT_BY_ID,
      variables: { id: projectId },
      data: dataInStore
    })
  }

export {
  updateActiveTemplate
}
