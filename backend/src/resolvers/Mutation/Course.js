const { checkAccess, Role, Privilege } = require('../../accessControl')
const { nullShield } = require('../../errors')

const CourseQueries = {
  async createCourse(root, { name, workspaceId }, context) {
    await checkAccess(context, {
      minimumRole: Role.GUEST,
      minimumPrivilege: Privilege.EDIT,
      workspaceId
    })
    return context.prisma.createCourse({
      name: name,
      createdBy: { connect: { id: context.user.id } },
      workspace: { connect: { id: workspaceId } }
    })
  },

  async deleteCourse(root, { id }, context) {
    const { id: workspaceId } = nullShield(await context.prisma.course({ id }).workspace())
    await checkAccess(context, {
      minimumRole: Role.GUEST,
      minimumPrivilege: Privilege.EDIT,
      workspaceId
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
    const { id: workspaceId } = nullShield(await context.prisma.course({ id }).workspace())
    await checkAccess(context, {
      minimumRole: Role.GUEST,
      minimumPrivilege: Privilege.EDIT,
      workspaceId
    })
    return await context.prisma.updateCourse({
      where: { id },
      data: { name }
    })
  }
}

module.exports = CourseQueries
