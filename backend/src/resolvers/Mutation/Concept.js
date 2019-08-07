const { checkAccess, Role, Privilege } = require('../../accessControl')

const ConceptMutations = {
  async createConcept(root, { name, description, official, courseId, workspaceId }, context) {
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
      courses: courseId ? { connect: [{ id: courseId }] } : undefined
    })
  },

  async updateConcept(root, { id, name, description }, context) {
    const { id: workspaceId } = await context.prisma.concept({ id }).workspace()
    await checkAccess(context, {
      minimumRole: Role.GUEST,
      minimumPrivilege: Privilege.EDIT,
      workspaceId
    })
    const data = {}
    if (name !== undefined) data.name = name
    if (description !== undefined) data.description = description

    return await context.prisma.updateConcept({
      where: { id },
      data: data
    })
  },

  async deleteConcept(root, { id }, context) {
    const { id: workspaceId } = await context.prisma.concept({ id }).workspace()
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
