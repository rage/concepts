const checkAccess = require('../../accessControl')

const CourseLinkQueries = {
  allCourseLinks(root, args, context) {
    return context.prisma.courseLink()
  },
  linksToCourse(root, args, context) {
    checkAccess(context, { allowStaff: true, allowStudent: true })
    return context.prisma.courseLink({
      id: args.id
    }).to()
  },
  linksFromCourse(root, args, context) {
    checkAccess(context, { allowStaff: true, allowStudent: true })
    return context.prisma.courseLink({
      id: args.id
    }).from()
  }
}

module.exports = CourseLinkQueries