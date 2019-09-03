const { ForbiddenError } = require('apollo-server-core')

const { checkAccess, Role, Privilege } = require('../../accessControl')
const { nullShield } = require('../../errors')

const CourseQueries = {
  async createCourse(root, { name, workspaceId, official, tags }, context) {
    await checkAccess(context, {
      minimumRole: official ? Role.STAFF : Role.GUEST,
      minimumPrivilege: Privilege.EDIT,
      workspaceId
    })
    const belongsToTemplate = await context.prisma.workspace({ id: workspaceId }).asTemplate()
    return context.prisma.createCourse({
      name: name,
      official: Boolean(belongsToTemplate || official),
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
    const toDelete = await context.prisma.conceptLink({ id })
    if (toDelete.frozen) throw new ForbiddenError('This course is frozen')
    await context.prisma.deleteManyCourseLinks({
      OR: [
        { from: { id } },
        { to: { id } }
      ]
    })
    return await context.prisma.deleteCourse({ id })
  },

  async updateCourse(root, { id, name, official, tags }, context) {
    const { id: workspaceId } = nullShield(await context.prisma.course({ id }).workspace())
    await checkAccess(context, {
      minimumRole: official ? Role.STAFF : Role.GUEST,
      minimumPrivilege: Privilege.EDIT,
      workspaceId
    })
    const belongsToTemplate = await context.prisma.workspace({ id: workspaceId }).asTemplate()
    const oldCourse = await context.prisma.course({ id })

    if (oldCourse.frozen) throw new ForbiddenError('This course is frozen')

    const oldTags = await context.prisma.course({ id }).tags()
    const tagsToDelete = oldTags
      .filter(oldTag => !tags.find(tag => tag.id === oldTag.id))
      .map(oldTag => ({ id: oldTag.id }))
    const tagsToCreate = tags
      .filter(tag => !oldTags.find(oldTag => oldTag.id === tag.id))

    const data = {
      tags: {
        delete: tagsToDelete,
        create: tagsToCreate
      },
      official: Boolean(official)
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
