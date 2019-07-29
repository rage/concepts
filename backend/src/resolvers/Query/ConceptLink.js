const { checkAccess, Role } = require('../../accessControl')

const ConceptLinkQueries = {
  async allConceptLinks(root, args, context) {
    await checkAccess(context, { minimumRole: Role.STAFF })
    return await context.prisma.conceptLinks()
  },
  async linksToConcept(root, args, context) {
    // TODO check privileges
    await checkAccess(context, { minimumRole: Role.STUDENT })
    return await context.prisma.conceptLink({
      id: args.id
    }).to()
  },
  async linksFromConcept(root, args, context) {
    // TODO check privileges
    await checkAccess(context, { minimumRole: Role.STUDENT })
    return context.prisma.conceptLink({
      id: args.id
    }).from()
  }
}

module.exports = ConceptLinkQueries
