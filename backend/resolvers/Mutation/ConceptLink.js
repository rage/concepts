const { checkAccess } = require('../../accessControl')

const ConceptLink = {
  async createConceptLink(root, { official, to, from, workspaceId }, context) {
    await checkAccess(context, {
      allowGuest: true, allowStudent: true, allowStaff: true,
      checkPrivilege: { requiredPrivilege: 'EDIT', workspaceId }
    })
    const linkExists = await context.prisma.$exists.conceptLink({
      AND: [
        { workspace: { id: workspaceId } },
        { to: { id: to } },
        { from: { id: from } }
      ]
    })
    if (linkExists) return null
    const data = {
      to:        { connect: { id: to } },
      from:      { connect: { id: from } },
      createdBy: { connect: { id: context.user.id } },
      workspace: { connect: { id: workspaceId } }
    }
    if (official !== undefined) data.official = official

    return await context.prisma.createConceptLink(data)
  },
  async deleteConceptLink(root, args, context) {
    const { id: workspaceId } = await context.prisma.conceptLink({ id: args.id }).workspace()
    await checkAccess(context, {
      allowGuest: true, allowStudent: true, allowStaff: true,
      checkPrivilege: { requiredPrivilege: 'EDIT', workspaceId }
    })
    return await context.prisma.deleteConceptLink({
      id: args.id
    })
  }
}

module.exports = ConceptLink
