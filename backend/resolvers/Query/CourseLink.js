const { checkAccess } = require('../../accessControl')

const CourseLinkQueries = {
  async allCourseLinks(root, args, context) {
    await checkAccess(context, { allowStaff: true })
    return await context.prisma.courseLinks()
  },
  async linksToCourse(root, args, context) {
    // TODO check privileges
    await checkAccess(context, { allowStaff: true, allowStudent: true })
    return await context.prisma.courseLink({
      id: args.id
    }).to()
  },
  async linksFromCourse(root, args, context) {
    // TODO check privileges
    await checkAccess(context, { allowStaff: true, allowStudent: true })
    return await context.prisma.courseLink({
      id: args.id
    }).from()
  }
}

module.exports = CourseLinkQueries
