const { checkPrivilege, Privilege } = require('../../accessControl')

const checkID = (obj, info, suffix = '') => {
  if (obj.__typename) {
    return obj.__typename
  }
  if (info.variableValues.id) {
    if (info.variableValues.id[0] === 'w') {
      return 'Workspace' + suffix
    } else if (info.variableValues.id[0] === 'p') {
      return 'Project' + suffix
    }
  }

  if (info.variableValues.token) {
    if (info.variableValues.token[0] === 'w') {
      return 'Workspace' + suffix
    } else if (info.variableValues.token[0] === 'p') {
      return 'Project' + suffix
    }
  }
  return null
}

module.exports = {
  Project: {
    participants(root, args, context) {
      return context.prisma.project({
        id: root.id
      }).participants()
    },
    workspaces(root, args, context) {
      return context.prisma.project({
        id: root.id
      }).workspaces()
    },
    templates(root, args, context) {
      return context.prisma.project({
        id: root.id
      }).templates()
    },
    activeTemplate(root, args, context) {
      return context.prisma.project({
        id: root.id
      }).activeTemplate()
    },
    async tokens(root, args, context) {
      if (!(await checkPrivilege(context, {
        minimumPrivilege: Privilege.OWNER,
        projectId: root.id
      }))) {
        return []
      }
      return await context.prisma.project({
        id: root.id
      }).tokens()
    }
  },
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
