const { checkAccess } = require('../../accessControl')

const CourseQueries = {
  async createCourseLink(root, { workspaceId, official, from, to }, context) {
    await checkAccess(context, {
      allowGuest: !official, allowStaff: true, allowStudent: !official,
      checkPrivilege: { requiredPrivilege: 'EDIT', workspaceId }
    })
    const linkExists = await context.prisma.$exists.courseLink({
      AND: [
        { workspace: { id: workspaceId } },
        { to: { id: to } },
        { from: { id: from } }
      ]
    })
    if (linkExists) return null
    return official !== undefined
      ? await context.prisma.createCourseLink({
        to: { connect: { id: to } },
        from: { connect: { id: from } },
        official: official,
        createdBy: { connect: { id: context.user.id } },
        workspace: { connect: { id: workspaceId } }
      })
      : await context.prisma.createCourseLink({
        to: { connect: { id: to } },
        from: { connect: { id: from } },
        createdBy: { connect: { id: context.user.id } },
        workspace: { connect: { id: workspaceId } }
      })
  },

  async deleteCourseLink(root, { id }, context) {
    const { id: workspaceId } = await context.prisma.courseLink({ id }).workspace()
    await checkAccess(context, {
      allowGuest: true, allowStaff: true, allowStudent: true,
      checkPrivilege: { requiredPrivilege: 'EDIT', workspaceId }
    })
    return await context.prisma.deleteCourseLink({ id })
  }
}

module.exports = CourseQueries
