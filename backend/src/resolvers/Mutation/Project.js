const { ForbiddenError } = require('apollo-server-core')

const { checkAccess, Role, Privilege } = require('../../accessControl')

const ProjectMutations = {
  async createProject(root, args, context) {
    await checkAccess(context, { minimumRole: Role.STAFF })
    return await context.prisma.createProject({
      name: args.name,
      participants: {
        create: [{
          privilege: Privilege.OWNER.toString(),
          user: { connect: { id: context.user.id } }
        }]
      }
    })
  },
  async deleteProject(root, args, context) {
    await checkAccess(context, {
      minimumRole: Role.STAFF,
      minimumPrivilege: Privilege.OWNER,
      projectId: args.id
    })
    return await context.prisma.deleteProject({
      id: args.id
    })
  },
  async updateProject(root, args, context) {
    await checkAccess(context, {
      minimumRole: Role.STAFF,
      minimumPrivilege: Privilege.EDIT,
      projectId: args.id
    })
    return await context.prisma.updateProject({
      where: { id: args.id },
      data: { name: args.name }
    })
  },
  async setActiveTemplate(root, args, context) {
    await checkAccess(context, {
      minimumRole: Role.STAFF,
      minimumPrivilege: Privilege.EDIT,
      projectId: args.projectId
    })

    const activeTemplate = await context.prisma.project({ id: args.projectId }).activeTemplate()
    if (activeTemplate?.id === args.workspaceId) {
      throw new ForbiddenError('Access denied')
    }

    return await context.prisma.updateProject({
      where: { id: args.projectId },
      data: {
        activeTemplate: args.workspaceId
          ? { connect: { id: args.workspaceId } }
          : { disconnect: true }
      }
    })
  }
}

module.exports = ProjectMutations
