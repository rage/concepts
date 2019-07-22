const { checkAccess } = require('../../accessControl')

const ConceptQueries = {
  async allConcepts(root, args, context) {
    await checkAccess(context, { allowStaff: true })
    return await context.prisma.concepts()
  },
  async conceptById(root, { id }, context) {
    const { id: workspaceId } = await context.prisma.concept({ id }).workspace()
    await checkAccess(context, {
      allowStaff: true, allowStudent: true,
      checkPrivilege: { requiredPrivilege: 'READ', workspaceId }
    })
    return await context.prisma.concept({ id })
  }
}

module.exports = ConceptQueries
