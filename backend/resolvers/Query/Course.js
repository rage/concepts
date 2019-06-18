const checkAccess = require('../../accessControl')

const CourseQueries = {
  allCourses(root, args, context) {
    checkAccess(context, { allowStaff: true, allowStudent: true })
    return context.prisma.courses()
  },
  courseById(root, args, context) {
    checkAccess(context, { allowStaff: true, allowStudent: true })
    return context.prisma.course({
      id: args.id
    })
  }
}

module.exports = CourseQueries