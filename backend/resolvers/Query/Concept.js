const { checkAccess } = require('../../accessControl')

const ConceptQueries = {
  allConcepts(root, args, context) {
    checkAccess(context, { allowStaff: true, allowStudent: true })
    return context.prisma.concepts()
  },
  conceptById(root, args, context) {
    checkAccess(context, { allowStaff: true, allowStudent: true })
    return context.prisma.concept({
      id: args.id
    })
  },
}

module.exports = ConceptQueries