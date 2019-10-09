const { ForbiddenError } = require('apollo-server-core')

const { checkAccess, Role, Privilege } = require('../../util/accessControl')
const { nullShield } = require('../../util/errors')
const { pubsub } = require('../Subscription/config')
const {
  COURSE_LINK_CREATED,
  COURSE_LINK_UPDATED,
  COURSE_LINK_DELETED
} = require('../Subscription/config/channels')

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
    const createdCourseLink =  context.prisma.createCourseLink({
      to: { connect: { id: to } },
      from: { connect: { id: from } },
      official: Boolean(official),
      createdBy: { connect: { id: context.user.id } },
      workspace: { connect: { id: workspaceId } }
    })
    pubsub.publish(COURSE_LINK_CREATED, {courseLinkCreated: createdCourseLink})
    return createdCourseLink
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

    const updatedCourseLink = await context.prisma.updateCourseLink({
      where: { id },
      data: { frozen, official }
    })
    pubsub.publish(COURSE_LINK_UPDATED, { courseLinkUpdated: updatedCourseLink })
    return updatedCourseLink
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
    const deletedCourseLink = await context.prisma.deleteCourseLink({ id })
    pubsub.publish(COURSE_LINK_DELETED, {courseLinkDeleted: deletedCourseLink})

    return deletedCourseLink
  }
}

module.exports = CourseQueries
