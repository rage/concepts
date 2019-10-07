const { ForbiddenError } = require('apollo-server-core')

const { checkAccess, Role, Privilege } = require('../../accessControl')
const { nullShield } = require('../../errors')
const { pubsub } = require('../Subscription/config')

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
    const newConceptLink =  await context.prisma.createConceptLink({
      to: { connect: { id: to } },
      from: { connect: { id: from } },
      createdBy: { connect: { id: context.user.id } },
      workspace: { connect: { id: workspaceId } },
      official: Boolean(official)
    })
    pubsub.publish('CONCEPT_LINK_CREATED', {conceptLinkCreated: newConceptLink})
    return newConceptLink
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
    pubsub.publish('CONCEPT_LINK_DELETED', {conceptLinkDeleted: toDelete})
    return await context.prisma.deleteConceptLink({
      id: args.id
    })
  }
}

module.exports = ConceptLink
