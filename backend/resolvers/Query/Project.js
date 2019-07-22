const { checkAccess } = require('../../accessControl')

const ProjectQueries = {
  allProjects(root, args, context) {
    checkAccess(context, { allowStaff: true })
    return context.prisma.projects()
  },
  projectById(root, args, context) {
    checkAccess(context, { allowStaff: true })
    return context.prisma.project({
      id: args.id
    })
  },
  projectsForUser(root, args, context) {
    checkAccess(context, { allowStaff: true })
    return context.prisma.user({
      where: {
        id: context.user.id
      }
    }).projectParticipations()
  }
}

module.exports = ProjectQueries
