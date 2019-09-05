const { ForbiddenError } = require('apollo-server-core')

const {
  checkAccess, checkPrivilege, Role, Privilege, privilegeToInt
} = require('../../accessControl')

const cloneTokenProjectQuery = `
query($id: ID!, $userId: ID!) {
  projectToken(where: { id: $id }) {
    project {
      id
      name
      activeTemplate {
        id
      }
      participants(where: { user: { id: $userId }}) {
        id
        user {
          id
        }
        privilege
      }
    }
  }
}
`

const workspaceBySourceTemplateQuery = `
query($id: ID!, $userId: ID!) {
  user(where: { id: $userId}) {
    workspaceParticipations(where: { workspace: { sourceTemplate: { id: $id }}}) {
      id
      workspace {
        id
        name
      }
    }
  }
}
`

const WorkspaceQueries = {
  async allWorkspaces(root, args, context) {
    await checkAccess(context, { minimumRole: Role.STAFF })
    return await context.prisma.workspaces()
  },
  async workspaceById(root, args, context) {
    await checkAccess(context, {
      minimumRole: Role.GUEST,
      minimumPrivilege: Privilege.READ,
      workspaceId: args.id
    })
    return await context.prisma.workspace({
      id: args.id
    })
  },
  async workspacesForUser(root, args, context) {
    await checkAccess(context, { minimumRole: Role.GUEST })
    return await context.prisma.user({
      id: context.user.id
    }).workspaceParticipations()
  },
  async workspaceBySourceTemplate(root, { sourceId }, context) {
    await checkAccess(context, { minimumRole: Role.GUEST })
    const res = await context.prisma.$graphql(workspaceBySourceTemplateQuery, {
      id: sourceId, userId: context.user.id
    })
    return res.user.workspaceParticipations[0] &&
      res.user.workspaceParticipations[0].workspace
  },
  async workspaceMemberInfo(root, { id }, context) {
    await checkAccess(context, { workspaceId: id, minimumPrivilege: Privilege.READ })
    const data = await context.prisma.workspace({ id }).$fragment(`
      fragment WorkspaceParticipants on Workspace {
        participants {
          id
          privilege
          token {
            id
            privilege
            revoked
          }
          user {
            id
            tmcId
            role
          }
        }
      }
    `)
    const participants = data.participants.map(pcp => ({
      participantId: pcp.id,
      privilege: pcp.privilege,
      token: pcp.token,
      ...pcp.user
    }))
    if (checkPrivilege(context, { workspaceId: id, minimumPrivilege: Privilege.OWNER })) {
      // TODO add name/email/username to participants
    }
    return participants
  }
}

module.exports = WorkspaceQueries
