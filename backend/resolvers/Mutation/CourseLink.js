const { checkAccess } = require('../../accessControl')

const CourseQueries = {
  async createCourseLink(root, args, context) {
    checkAccess(context, { allowGuest: true, allowStaff: true, allowStudent: true })
    const linkExists = await context.prisma.$exists.courseLink({
      AND: [
        { workspace: { id: args.workspaceId } },
        { to: { id: args.to } },
        { from: { id: args.from } }
      ]
    })
    if (linkExists) return null
    return args.official !== undefined
      ? context.prisma.createCourseLink({
        to: {
          connect: { id: args.to }
        },
        from: {
          connect: { id: args.from }
        },
        official: args.official,
        createdBy: { connect: { id: context.user.id } },
        workspace: { connect: { id: args.workspaceId } }
      })
      : context.prisma.createCourseLink({
        to: {
          connect: { id: args.to }
        },
        from: {
          connect: { id: args.from }
        },
        createdBy: { connect: { id: context.user.id } },
        workspace: { connect: { id: args.workspaceId } }
      })
  },

  async deleteCourseLink(root, args, context) {
    const user = await context.prisma.courseLink({ id: args.id }).createdBy()
    checkAccess(context, { allowGuest: true, allowStaff: true, allowStudent: true, verifyUser: true, userId: user.id })
    return context.prisma.deleteCourseLink({
      id: args.id
    })
  }
}

module.exports = CourseQueries
