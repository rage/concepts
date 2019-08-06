const { checkAccess, Role, Privilege } = require('../../accessControl')

const CourseQueries = {
  async allCourses(root, args, context) {
    await checkAccess(context, { minimumRole: Role.STAFF })
    return await context.prisma.courses()
  },
  async courseById(root, { id }, context) {
    const { id: workspaceId } = await context.prisma.course({ id }).workspace()
    await checkAccess(context, {
      minimumRole: Role.GUEST,
      minimumPrivilege: Privilege.READ,
      workspaceId
    })
    return await context.prisma.course({ id: id })
  },
  async courseAndPrerequisites(root, { courseId }, context) {
    await checkAccess(context, {
      minimumRole: Role.GUEST
    })
    const { id: workspaceId } = await context.prisma.course({ id: courseId }).workspace()
    await checkAccess(context, {
      minimumPrivilege: Privilege.READ,
      workspaceId
    })

    return await context.prisma.course({
      id: courseId
    })
  },
  async coursesByWorkspace(root, { workspaceId }, context) {
    await checkAccess(context, {
      minimumRole: Role.GUEST,
      minimumPrivilege: Privilege.READ,
      workspaceId
    })
    return await context.prisma.courses({
      where: {
        workspace: {
          id: workspaceId
        }
      }
    })
  }
}

module.exports = CourseQueries
