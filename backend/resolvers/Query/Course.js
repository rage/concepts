const { checkAccess } = require('../../accessControl')

const CourseQueries = {
  async allCourses(root, args, context) {
    await checkAccess(context, { allowStaff: true })
    return await context.prisma.courses()
  },
  async courseById(root, { id }, context) {
    const { id: workspaceId } = await context.prisma.course({ id }).workspace()
    await checkAccess(context, {
      allowGuest: true, allowStaff: true, allowStudent: true,
      checkPrivilege: { requiredPrivilege: 'READ', workspaceId }
    })
    return await context.prisma.course({ id: id })
  },
  async courseAndPrerequisites(root, { courseId, workspaceId }, context) {
    await checkAccess(context, {
      allowGuest: true, allowStaff: true, allowStudent: true,
      checkPrivilege: { requiredPrivilege: 'READ', workspaceId }
    })
    // Check if the course is related to the workspace
    const courses = await context.prisma
      .workspace({ id: workspaceId })
      .courses({
        where: {
          id: courseId
        }
      })

    if (courses.length > 0) {
      return await context.prisma.course({
        id: courseId
      })
    }
    return null
  },
  async coursesByWorkspace(root, { workspaceId }, context) {
    await checkAccess(context, {
      allowGuest: true, allowStaff: true, allowStudent: true,
      checkPrivilege: { requiredPrivilege: 'READ', workspaceId }
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
