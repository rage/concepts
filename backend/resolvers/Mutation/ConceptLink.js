const checkAccess = require('../../accessControl')

const ConceptLink = {
    createConceptLink(root, args, context) {
      checkAccess(context, { allowStudent: true })
      return args.official !== undefined
        ? context.prisma.createConceptLink({
          to: {
            connect: { id: args.targetConcept }
          },
          from: {
            connect: { id: args.prerequisiteConcept, }
          },
          createdBy: {
            connect: { id: context.user.id }
          },
          official: args.official
        })
        : context.prisma.createConceptLink({
          to: {
            connect: { id: args.targetConcept }
          },
          from: {
            connect: { id: args.prerequisiteConcept }
          },
          createdBy: {
            connect: { id: context.user.id }
          }
        })
    },
    deleteConceptLink(root, args, context) {
      checkAccess(context, { allowStudent: true })
      return context.prisma.deleteConceptLink({
        id: args.id
      })
    }
}

module.exports = ConceptLink