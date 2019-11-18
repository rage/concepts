import {
  WORKSPACE_BY_ID_MEMBER_INFO
} from '../../graphql/Query'
import * as objectRecursion from '../../lib/objectRecursion'

const workspaceMemberCreated = (workspaceId) => 
  (store, response) => {
    const createdMember = response.data.workspaceMemberCreated
    const data = store.readQuery({
      query: WORKSPACE_BY_ID_MEMBER_INFO,
      variables: { id: workspaceId }
    })

    objectRecursion.push(members, 'workspaceMemberInfo', createdMember)
    
    store.writeQuery({
      query: WORKSPACE_BY_ID_MEMBER_INFO,
      variables: { id: workspaceId },
      data
    })
    
}

export {
  workspaceMemberCreated
}