const { checkAccess } = require('../../accessControl')

const CourseQueries = {
  async createCourse(root, { name, workspaceId }, context) {
    await checkAccess(context, {
      allowGuest: true, allowStaff: true, allowStudent: true,
      checkPrivilege: { requiredPrivilege: 'EDIT', workspaceId }
    })
    return context.prisma.createCourse({
      name: name,
      createdBy: { connect: { id: context.user.id } },
      workspace: { connect: { id: workspaceId } }
    })
  },

  async deleteCourse(root, { id }, context) {
    const { id: workspaceId } = await context.prisma.courseLink({ id }).workspace()
    await checkAccess(context, {
      allowGuest: true, allowStaff: true, allowStudent: true,
      checkPrivilege: { requiredPrivilege: 'EDIT', workspaceId }
    })
    await context.prisma.deleteManyCourseLinks({
      OR: [
        { from: { id } },
        { to: { id } }
      ]
    })
    return await context.prisma.deleteCourse({ id })
  },

  async updateCourse(root, { id, name }, context) {
    const { id: workspaceId } = await context.prisma.course({ id }).workspace()
    await checkAccess(context, {
      allowGuest: true, allowStaff: true, allowStudent: true,
      checkPrivilege: { requiredPrivilege: 'EDIT', workspaceId }
    })
    return await context.prisma.updateCourse({
      where: { id },
      data: { name }
    })
  }
}

module.exports = CourseQueries
