import {
  WORKSPACE_BY_ID_MEMBER_INFO,
  PROJECT_BY_ID_MEMBER_INFO
} from '../../graphql/Query'
import * as objectRecursion from '../../lib/objectRecursion'

const getMemberInfo = (workspaceMember) => ({
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
})

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

    const obj = objectRecursion.get(data,
      `${type.toLowerCase()}MemberInfo[participantId=${updateMember.id}]`)
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
    const { [`delete${type}Member`]: deleteMember } = response.data
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

export const createWorkspaceMemberUpdate = createMember('Workspace')
export const createProjectMemberUpdate = createMember('Project')

export const updateWorkspaceMemberUpdate = updateMember('Workspace')
export const updateProjectMemberUpdate = updateMember('Project')

export const deleteWorkspaceMemberUpdate = deleteMember('Workspace')
export const deleteProjectMemberUpdate = deleteMember('Project')
