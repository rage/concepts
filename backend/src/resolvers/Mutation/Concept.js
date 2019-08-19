const { checkAccess, Role, Privilege } = require('../../accessControl')
const { nullShield } = require('../../errors')

const ConceptMutations = {
  async createConcept(root, { name, description, official, courseId, workspaceId, bloomsTag }, context) {
    await checkAccess(context, {
      minimumRole: Role.GUEST,
      minimumPrivilege: Privilege.EDIT,
      workspaceId
    })

    return await context.prisma.createConcept({
      name,
      createdBy: { connect: { id: context.user.id } },
      workspace: { connect: { id: workspaceId } },
      description: description,
      official: Boolean(official),
      courses: courseId ? { connect: [{ id: courseId }] } : undefined,
      bloomsTag
    })
  },

  async updateConcept(root, { id, name, description, bloomsTag }, context) {
    const { id: workspaceId } = nullShield(await context.prisma.concept({ id }).workspace())
    await checkAccess(context, {
      minimumRole: Role.GUEST,
      minimumPrivilege: Privilege.EDIT,
      workspaceId
    })
    const data = {}
    if (name !== undefined) data.name = name
    if (description !== undefined) data.description = description
    if (bloomsTag !== undefined) data.bloomsTag = bloomsTag

    return await context.prisma.updateConcept({
      where: { id },
      data: data
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
