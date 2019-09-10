const { ForbiddenError } = require('apollo-server-core')

const { checkAccess, Role, Privilege } = require('../../accessControl')
const { nullShield } = require('../../errors')

const CourseQueries = {
  async createCourse(root, { name, workspaceId, official, frozen, tags }, context) {
    await checkAccess(context, {
      minimumRole: Role.GUEST,
      minimumPrivilege: Privilege.EDIT,
      workspaceId
    })
    const belongsToTemplate = await context.prisma.workspace({ id: workspaceId }).asTemplate()

    if (official || frozen) await checkAccess(context, { minimumRole: Role.STAFF, workspaceId })

    return context.prisma.createCourse({
      name: name,
      official: Boolean(belongsToTemplate || official),
      frozen: Boolean(frozen),
      createdBy: { connect: { id: context.user.id } },
      workspace: { connect: { id: workspaceId } },
      tags: { create: tags }
    })
  },

  async deleteCourse(root, { id }, context) {
    const { id: workspaceId } = nullShield(await context.prisma.course({ id }).workspace())
    await checkAccess(context, {
      minimumRole: Role.GUEST,
      minimumPrivilege: Privilege.EDIT,
      workspaceId
    })
    const toDelete = await context.prisma.course({ id })
    if (toDelete.frozen) throw new ForbiddenError('This course is frozen')
    await context.prisma.deleteManyCourseLinks({
      OR: [
        { from: { id } },
        { to: { id } }
      ]
    })
    return await context.prisma.deleteCourse({ id })
  },

  async updateCourse(root, { id, name, official, frozen, tags }, context) {
    const { id: workspaceId } = nullShield(await context.prisma.course({ id }).workspace())
    await checkAccess(context, {
      minimumRole: Role.GUEST,
      minimumPrivilege: Privilege.EDIT,
      workspaceId
    })
    const oldCourse = await context.prisma.course({ id })

    if (oldCourse.frozen && frozen !== false)
      throw new ForbiddenError('This course is frozen')
    if ((official !== undefined && official !== oldCourse.official)
      || (frozen || oldCourse.frozen)) {
      await checkAccess(context, {
        minimumRole: Role.STAFF,
        workspaceId
      })
    }

    const belongsToTemplate = await context.prisma.workspace({ id: workspaceId }).asTemplate()
    const oldTags = await context.prisma.course({ id }).tags()

    const tagsToDelete = tags
      ? oldTags.filter(oldTag => !tags.find(tag => tag.id === oldTag.id))
        .map(oldTag => ({ id: oldTag.id }))
      : []
    const tagsToCreate = tags
      ? tags.filter(tag => !oldTags.find(oldTag => oldTag.id === tag.id))
      : []

    const data = {
      tags: {
        delete: tagsToDelete,
        create: tagsToCreate
      },
      official: Boolean(official),
      frozen: Boolean(frozen)
    }
    if (name !== undefined) {
      if (!belongsToTemplate && name !== oldCourse.name) data.official = false
      data.name = name
    }

    return await context.prisma.updateCourse({
      where: { id },
      data
    })
  }
}

module.exports = CourseQueries
