const { checkAccess, Role, Privilege } = require('../../accessControl')

const ProjectMutations = {
  async createProject(root, args, context) {
    await checkAccess(context, { minimumRole: Role.STAFF })
    return await context.prisma.createProject({
      name: args.name,
      participants: {
        create: [{
          privilege: 'OWNER',
          user: {
            connect: { id: context.user.id }
          }
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
  }
}

module.exports = ProjectMutations
