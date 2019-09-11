const { ForbiddenError } = require('apollo-server-core')

const { checkAccess, Role, Privilege } = require('../../accessControl')
const { nullShield } = require('../../errors')

const CourseQueries = {
  async createCourseLink(root, { workspaceId, official, from, to }, context) {
    await checkAccess(context, {
      minimumRole: official ? Role.STAFF : Role.GUEST,
      minimumPrivilege: Privilege.EDIT,
      workspaceId
    })
    const linkExists = await context.prisma.$exists.courseLink({
      AND: [
        { workspace: { id: workspaceId } },
        { to: { id: to } },
        { from: { id: from } }
      ]
    })
    if (linkExists) return null
    return await context.prisma.createCourseLink({
      to: { connect: { id: to } },
      from: { connect: { id: from } },
      official: Boolean(official),
      createdBy: { connect: { id: context.user.id } },
      workspace: { connect: { id: workspaceId } }
    })
  },
  async updateCourseLink(root, { id, frozen, official }, context) {
    const { id: workspaceId } = nullShield(await context.prisma.courseLink({ id }).workspace())
    await checkAccess(context, {
      minimumRole: Role.STAFF,
      minimumPrivilege: Privilege.EDIT,
      workspaceId
    })
    const oldLink = await context.prisma.courseLink({ id })
    if (oldLink.frozen && frozen !== false) throw new ForbiddenError('This link is frozen')

    return await context.prisma.updateCourseLink({
      where: { id },
      data: { frozen, official }
    })
  },
  async deleteCourseLink(root, { id }, context) {
    const { id: workspaceId } = nullShield(await context.prisma.courseLink({ id }).workspace())
    await checkAccess(context, {
      minimumRole: Role.GUEST,
      minimumPrivilege: Privilege.EDIT,
      workspaceId
    })
    const toDelete = await context.prisma.courseLink({ id })
    if (toDelete.frozen) throw new ForbiddenError('This link is frozen')
    return await context.prisma.deleteCourseLink({ id })
  }
}

module.exports = CourseQueries
