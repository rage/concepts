import {
  WORKSPACE_BY_ID_MEMBER_INFO,
  PROJECT_BY_ID_MEMBER_INFO
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

const createMember = type => (id) => 
  (store, response) => {
    const query = type === 'Workspace' ? WORKSPACE_BY_ID_MEMBER_INFO : PROJECT_BY_ID_MEMBER_INFO
    const { [`create${type}Member`]: createMember } = response.data
    const data = store.readQuery({
      query,
      variables: { id }
    })
  
    objectRecursion.push(data, `${type.toLowerCase()}MemberInfo`, getMemberInfo(createMember))
    
    store.writeQuery({
      query,
      variables: { id },
      data
    })   
}

const updateMember = type => (id) => 
  (store, response) => {
    const query = type === 'Workspace' ? WORKSPACE_BY_ID_MEMBER_INFO : PROJECT_BY_ID_MEMBER_INFO
    const { [`update${type}Member`]: updateMember } = response.data
    const data = store.readQuery({
      query,
      variables: { id }
    })
    
    const obj = objectRecursion.get(data, `${type.toLowerCase()}MemberInfo[participantId=${updateMember.id}]`)
    obj.privilege = updateMember.privilege

    store.writeQuery({
      query,
      variables: { id },
      data
    })
}

const deleteMember = type => (id) => 
  (store, response) => {
    const query = type === 'Workspace' ? WORKSPACE_BY_ID_MEMBER_INFO : PROJECT_BY_ID_MEMBER_INFO
    const {[`delete${type}Member`]: deleteMember } = response.data
    const data = store.readQuery({
      query,
      variables: { id }
    })

    objectRecursion.del(data, `${type.toLowerCase()}MemberInfo[participantId=${deleteMember.id}]`)

    store.writeQuery({
      query,
      variables: { id },
      data
    })
}

const createWorkspaceMemberUpdate = createMember('Workspace')
const createProjectMemberUpdate = createMember('Project')

const updateWorkspaceMemberUpdate = updateMember('Workspace')
const updateProjectMemberUpdate = updateMember('Project')

const deleteWorkspaceMemberUpdate = deleteMember('Workspace')
const deleteProjectMemberUpdate = deleteMember('Project')

export {
  createWorkspaceMemberUpdate,
  createProjectMemberUpdate,
  updateWorkspaceMemberUpdate,
  updateProjectMemberUpdate,
  deleteWorkspaceMemberUpdate,
  deleteProjectMemberUpdate
}