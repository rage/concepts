const { checkAccess } = require('../../accessControl')

const ConceptLinkQueries = {
  async allConceptLinks(root, args, context) {
    await checkAccess(context, { allowStaff: true })
    return await context.prisma.conceptLinks()
  },
  async linksToConcept(root, args, context) {
    // TODO check privileges
    await checkAccess(context, { allowStaff: true, allowStudent: true })
    return await context.prisma.conceptLink({
      id: args.id
    }).to()
  },
  async linksFromConcept(root, args, context) {
    // TODO check privileges
    await checkAccess(context, { allowStaff: true, allowStudent: true })
    return context.prisma.conceptLink({
      id: args.id
    }).from()
  }
}

module.exports = ConceptLinkQueries
