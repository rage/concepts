const { checkAccess, Role, Privilege } = require('../../accessControl')

const ConceptQueries = {
  async allConcepts(root, args, context) {
    await checkAccess(context, { minimumRole: Role.STAFF })
    return await context.prisma.concepts()
  },
  async conceptById(root, { id }, context) {
    const { id: workspaceId } = await context.prisma.concept({ id }).workspace()
    await checkAccess(context, {
      minimumRole: Role.GUEST,
      minimumPrivilege: Privilege.READ,
      workspaceId
    })
    return await context.prisma.concept({ id })
  }
}

module.exports = ConceptQueries
