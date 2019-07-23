const { checkAccess, Role, Privilege } = require('../../accessControl')

const ConceptMutations = {
  async createConcept(root, { name, description, official, courseId, workspaceId }, context) {
    await checkAccess(context, {
      minimumRole: Role.GUEST,
      minimumPrivilege: Privilege.EDIT,
      workspaceId
    })
    const data = {
      name,
      createdBy: { connect: { id: context.user.id } },
      workspace: { connect: { id: workspaceId } }
    }
    if (description !== undefined) data.description = description
    if (official !== undefined) data.official = official
    if (courseId !== undefined) data.courses = { connect: [{ id: courseId }] }

    return await context.prisma.createConcept(data)
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
    return await context.prisma.deleteConcept({ id })
  }
}

module.exports = ConceptMutations
