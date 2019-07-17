const { checkAccess } = require('../../accessControl')

const CourseQueries = {
  createCourse(root, args, context) {
    checkAccess(context, { allowGuest:true, allowStaff: true, allowStudent: true })
    return context.prisma.createCourse({
      name: args.name,
      createdBy: { connect: { id: context.user.id } },
      workspace: { connect: { id: args.workspaceId } }
    })
  },

  async deleteCourse(root, args, context) {
    const user = await context.prisma.courseLink({ id: args.id }).createdBy()
    checkAccess(context, {
      allowGuest: true, allowStaff: true, allowStudent: true, verifyUser: true, userId: user.id
    })
    await context.prisma.deleteManyCourseLinks({
      OR: [
        {
          from: {
            id: args.id
          }

        },
        {
          to: {
            id: args.id
          }
        }
      ]
    })
    return context.prisma.deleteCourse({
      id: args.id
    })
  },

  async updateCourse(root, args, context) {
    const user = await context.prisma.course({ id: args.id }).createdBy()
    checkAccess(context, {
      allowGuest: true, allowStaff: true, allowStudent: true, verifyUser: true, userId: user.id
    })
    return await context.prisma.updateCourse({
      where: { id: args.id },
      data: { name: args.name }
    })
  }
}

module.exports = CourseQueries
