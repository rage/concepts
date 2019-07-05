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
  projectsByOwner(root, args, context) {
    checkAccess(context, { allowStaff: true })
    return context.prisma.projects({
      where: {
        owner: { id: args.ownerId }
      }
    })
  }
}

module.exports = ProjectQueries
