import { Privilege } from '../../util/accessControl'
import makeTypeResolvers from './typeutil'

const checkID = (obj, info, suffix = '') => {
  if (obj.__typename) {
    return obj.__typename
  } else if (info.variableValues.id?.[0] === 'w' || info.variableValues.token?.[0] === 'w') {
    return 'Workspace' + suffix
  } else if (info.variableValues.id?.[0] === 'p' || info.variableValues.token?.[0] === 'p') {
    return 'Project' + suffix
  }
  return null
}

export const Project = makeTypeResolvers('project', [
  'participants',
  'workspaces',
  'templates',
  'merges',
  'activeTemplate',
  {
    name: 'tokens',
    checkPrivilegeArgs: root => ({
      minimumPrivilege: Privilege.OWNER,
      projectId: root.id
    }),
    insufficientPrivilegeValue: () => []
  }
])

export const ProjectOrWorkspace = {
  __resolveType: (obj, context, info) => checkID(obj, info)
}
export const ProjectOrWorkspaceParticipant = {
  __resolveType: (obj, context, info) => checkID(obj, info, 'Participant')
}
export const ProjectOrWorkspaceToken = {
  __resolveType: (obj, context, info) => checkID(obj, info, 'Token')
}
