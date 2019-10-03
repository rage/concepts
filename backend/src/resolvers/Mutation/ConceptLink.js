const { ForbiddenError } = require('apollo-server-core')

const { checkAccess, Role, Privilege } = require('../../util/accessControl')
const { nullShield } = require('../../util/errors')

const ConceptLink = {
  async createConceptLink(root, { official, to, from, workspaceId }, context) {
    await checkAccess(context, {
      minimumRole: Role.GUEST,
      minimumPrivilege: Privilege.EDIT,
      workspaceId
    })
    const linkExists = await context.prisma.$exists.conceptLink({
      AND: [
        { workspace: { id: workspaceId } },
        { to: { id: to } },
        { from: { id: from } }
      ]
    })
    if (linkExists) return null
    return await context.prisma.createConceptLink({
      to: { connect: { id: to } },
      from: { connect: { id: from } },
      createdBy: { connect: { id: context.user.id } },
      workspace: { connect: { id: workspaceId } },
      official: Boolean(official)
    })
  },
  async deleteConceptLink(root, args, context) {
    const { id: workspaceId } = nullShield(
      await context.prisma.conceptLink({ id: args.id }).workspace())
    await checkAccess(context, {
      minimumRole: Role.GUEST,
      minimumPrivilege: Privilege.EDIT,
      workspaceId
    })
    const toDelete = await context.prisma.conceptLink({ id: args.id })
    if (toDelete.frozen) throw new ForbiddenError('This link is frozen')
    return await context.prisma.deleteConceptLink({
      id: args.id
    })
  }
}

module.exports = ConceptLink
