const { ForbiddenError } = require('apollo-server-core')

const { checkAccess, Role, Privilege, privilegeToInt } = require('../../accessControl')

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
  async peekToken(root, { id }, context) {
    await checkAccess(context, { minimumRole: Role.GUEST })
    let privilege
    if (id[0] === 'w') {
      privilege = await context.prisma.workspaceToken({ id }).privilege()
    } else if (id[0] === 'p') {
      privilege = await context.prisma.projectToken({ id }).privilege()
    } else {
      throw Error('invalid share token')
    }
    if (privilege === Privilege.CLONE && id[0] === 'p') {
      const data = await context.prisma.$graphql(cloneTokenProjectQuery, {
        id,
        userId: context.user.id
      })
      return {
        __typename: 'LimitedProject',
        id: data.projectToken.project.id,
        name: data.projectToken.project.name,
        activeTemplateId: data.projectToken.project.activeTemplate.id,
        participants: data.projectToken.project.participants
      }
    }
    if (privilegeToInt(privilege) < privilegeToInt(Privilege.READ)) {
      throw new ForbiddenError('Token does not allow reading')
    }

    if (id[0] === 'w') {
      return await context.prisma.workspaceToken({ id }).workspace()
    }
    return await context.prisma.projectToken({ id }).project()
  },
  async workspaceBySourceTemplate(root, { sourceId }, context) {
    await checkAccess(context, { minimumRole: Role.GUEST })
    const res = await context.prisma.$graphql(workspaceBySourceTemplateQuery, {
      id: sourceId, userId: context.user.id
    })
    return res.user.workspaceParticipations[0] &&
      res.user.workspaceParticipations[0].workspace
  }
}

module.exports = WorkspaceQueries
