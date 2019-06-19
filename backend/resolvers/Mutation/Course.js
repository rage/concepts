const checkAccess = require('../../accessControl')

const CourseQueries = {
  createCourse(root, args, context) {
    checkAccess(context, { allowStaff: true, allowStudent: true })
    return context.prisma.createCourse({
      name: args.name,
      createdBy: { connect: { id: context.user.id } },
      workspaces: { connect: [{ id: args.workspaceId }] }
    })
  },

  deleteCourse(root, args, context) {
    checkAccess(context, { allowStaff: true, allowStudent: true })
    return context.prisma.deleteCourse({
      id: args.id
    })
  },

  updateCourse(root, args, context) {
    checkAccess(context, { allowStaff: true, allowStudent: true })
    return context.prisma.updateCourse({
      where: { id: args.id },
      data: { name: args.name }
    })
  }
}

module.exports = CourseQueries