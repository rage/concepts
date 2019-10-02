const { checkAccess, Role, Privilege } = require('../../accessControl')
const { nullShield } = require('../../errors')

const CourseQueries = {
  async courseById(root, { id }, context) {
    const { id: workspaceId } = nullShield(await context.prisma.course({ id }).workspace())
    await checkAccess(context, {
      minimumRole: Role.GUEST,
      minimumPrivilege: Privilege.READ,
      workspaceId
    })
    return await context.prisma.course({ id: id })
  }
}

module.exports = CourseQueries
