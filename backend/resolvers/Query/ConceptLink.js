const { checkAccess } = require('../../accessControl')

const ConceptLinkQueries = {
  allConceptLinks(root, args, context) {
    return context.prisma.conceptLinks()
  },
  linksToConcept(root, args, context) {
    checkAccess(context, { allowStaff: true, allowStudent: true })
    return context.prisma.conceptLink({
      id: args.id
    }).to()
  },
  linksFromConcept(root, args, context) {
    checkAccess(context, { allowStaff: true, allowStudent: true })
    return context.prisma.conceptLink({
      id: args.id
    }).from()
  }
}

module.exports = ConceptLinkQueries