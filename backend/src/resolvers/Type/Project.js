const { Privilege } = require('../../util/accessControl')
const { makeTypeResolvers } = require('./typeutil')

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

module.exports = {
  Project: makeTypeResolvers('project', [
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
  ]),
  ProjectOrWorkspace: {
    __resolveType: (obj, context, info) => checkID(obj, info)
  },
  ProjectOrWorkspaceParticipant: {
    __resolveType: (obj, context, info) => checkID(obj, info, 'Participant')
  },
  ProjectOrWorkspaceToken: {
    __resolveType: (obj, context, info) => checkID(obj, info, 'Token')
  }
}
