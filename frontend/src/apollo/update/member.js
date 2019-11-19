import {
  WORKSPACE_BY_ID_MEMBER_INFO
} from '../../graphql/Query'
import * as objectRecursion from '../../lib/objectRecursion'

const getMemberInfo = (workspaceMember) => {
  return {
    participantId: workspaceMember.id,
    id: workspaceMember.user.id,
    role: workspaceMember.user.role, 
    privilege: workspaceMember.privilege,
    token: workspaceMember.token,
    tmcId: null,
    name: null,
    email: null,
    username: null,
    __typename: 'MemberInfo'
  }
}

const createWorkspaceMember = (workspaceId) => 
  (store, response) => {
    const { createWorkspaceMember } = response.data
    const data = store.readQuery({
      query: WORKSPACE_BY_ID_MEMBER_INFO,
      variables: { id: workspaceId }
    })
  
    objectRecursion.push(data, 'workspaceMemberInfo', getMemberInfo(createWorkspaceMember))
    
    store.writeQuery({
      query: WORKSPACE_BY_ID_MEMBER_INFO,
      variables: { id: workspaceId },
      data
    })   
}

const updateWorkspaceMember = (workspaceId) => 
  (store, response) => {
    const { updateWorkspaceMember } = response.data
    const data = store.readQuery({
      query: WORKSPACE_BY_ID_MEMBER_INFO,
      variables: { id: workspaceId }
    })
    
    const obj = objectRecursion.get(data, `workspaceMemberInfo[participantId=${updateWorkspaceMember.id}]`)
    obj.privilege = updateWorkspaceMember.privilege

    store.writeQuery({
      query: WORKSPACE_BY_ID_MEMBER_INFO,
      variables: { id: workspaceId },
      data
    })
}

const deleteWorkspaceMember = (workspaceId) => 
  (store, response) => {
    const { deleteWorkspaceMember } = response.data
    const data = store.readQuery({
      query: WORKSPACE_BY_ID_MEMBER_INFO,
      variables: { id: workspaceId }
    })

    objectRecursion.del(data, `workspaceMemberInfo[participantId=${deleteWorkspaceMember.id}]`)

    store.writeQuery({
      query: WORKSPACE_BY_ID_MEMBER_INFO,
      variables: { id: workspaceId },
      data
    })
}

export {
  createWorkspaceMember,
  updateWorkspaceMember,
  deleteWorkspaceMember
}