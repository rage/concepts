const { checkAccess, Role, Privilege } = require('../../accessControl')

const ProjectQueries = {
  async allProjects(root, args, context) {
    await checkAccess(context, { minimumRole: Role.STAFF })
    return await context.prisma.projects()
  },
  async projectById(root, args, context) {
    await checkAccess(context, {
      allowStaff: true,
      checkPrivilege: {
        minimumRole: Role.STAFF,
        minimumPrivilege: Privilege.READ,
        projectId: args.id
      }
    })
    return context.prisma.project({
      id: args.id
    })
  },
  async projectsForUser(root, args, context) {
    await checkAccess(context, { minimumRole: Role.STAFF })
    return await context.prisma.user({
      id: context.user.id
    }).projectParticipations()
  }
}

module.exports = ProjectQueries
