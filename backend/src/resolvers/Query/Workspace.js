const { ForbiddenError } = require('apollo-server-core')

const { checkAccess, Role, Privilege, privilegeToInt } = require('../../accessControl')

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
    if (privilegeToInt(privilege) < privilegeToInt(Privilege.CLONE)) {
      throw ForbiddenError('Token does not allow reading')
    }

    if (id[0] === 'w') {
      return await context.prisma.workspaceToken({ id }).workspace()
    }
    return await context.prisma.projectToken({ id }).project()
  }
}

module.exports = WorkspaceQueries