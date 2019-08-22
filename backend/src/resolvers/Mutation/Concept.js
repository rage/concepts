const { checkAccess, Role, Privilege } = require('../../accessControl')
const { nullShield } = require('../../errors')

const ConceptMutations = {
  async createConcept(root, { name, description, official, courseId, workspaceId, tags }, context) {
    await checkAccess(context, {
      minimumRole: official ? Role.STAFF : Role.GUEST,
      minimumPrivilege: Privilege.EDIT,
      workspaceId
    })

    const belongsToTemplate = await context.prisma.workspace({ id: workspaceId }).asTemplate()

    return await context.prisma.createConcept({
      name,
      createdBy: { connect: { id: context.user.id } },
      workspace: { connect: { id: workspaceId } },
      description: description,
      official: Boolean(belongsToTemplate || official),
      courses: courseId ? { connect: [{ id: courseId }] } : undefined,
      tags: { create: tags }
    })
  },

  async updateConcept(root, { id, name, description, official, tags }, context) {
    const { id: workspaceId } = nullShield(await context.prisma.concept({ id }).workspace())
    await checkAccess(context, {
      minimumRole: official ? Role.STAFF : Role.GUEST,
      minimumPrivilege: Privilege.EDIT,
      workspaceId
    })

    const oldTags = await context.prisma.concept({ id }).tags()
    const oldConcept = await context.prisma.concept({ id })
    const belongsToTemplate = await context.prisma.workspace({ id: workspaceId }).asTemplate()

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

    if (description !== undefined) data.description = description
    if (name !== undefined) {
      if (!belongsToTemplate && name !== oldConcept.name) data.official = false
      data.name = name
    }

    return await context.prisma.updateConcept({
      where: { id },
      data
    })
  },

  async deleteConcept(root, { id }, context) {
    const { id: workspaceId } = nullShield(await context.prisma.concept({ id }).workspace())
    await checkAccess(context, {
      minimumRole: Role.GUEST,
      minimumPrivilege: Privilege.EDIT,
      workspaceId
    })
    const toDelete = await context.prisma.concept({ id }).$fragment(`
      fragment ConceptWithCourse on Concept {
        id
        courses {
          id
        }
      }
    `)
    await context.prisma.deleteConcept({ id })
    return {
      id: toDelete.id,
      courseId: toDelete.courses[0].id
    }
  }
}

module.exports = ConceptMutations
