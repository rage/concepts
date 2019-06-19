const checkAccess = require('../../accessControl')

const CourseQueries = {
  createCourseLink(root, args, context) {
    checkAccess(context, { allowStaff: true, allowStudent: true })
    return args.official !== undefined
      ? context.prisma.createCourseLink({
        to: {
          connect: { id: args.to }
        },
        from: {
          connect: { id: args.from, }
        },
        official: args.official,
        createdBy: { connect: { id: context.user.id } }
      })
      : context.prisma.createCourseLink({
        to: {
          connect: { id: args.to }
        },
        from: {
          connect: { id: args.from }
        },
        createdBy: { connect: { id: context.user.id } }
      })
  },

  deleteCourseLink(root, args, context) {
    checkAccess(context, { allowStaff: true, allowStudent: true })
    return context.prisma.deleteLink({
      id: args.id
    })
  }
}

module.exports = CourseQueries