const { checkAccess } = require('../../accessControl')

const ConceptLink = {
    createConceptLink(root, args, context) {
      checkAccess(context, { allowStudent: true })
      return args.official !== undefined
        ? context.prisma.createConceptLink({
          to: {
            connect: { id: args.to }
          },
          from: {
            connect: { id: args.from, }
          },
          createdBy: {
            connect: { id: context.user.id }
          },
          official: args.official
        })
        : context.prisma.createConceptLink({
          to: {
            connect: { id: args.to }
          },
          from: {
            connect: { id: args.from }
          },
          createdBy: {
            connect: { id: context.user.id }
          }
        })
    },
    async deleteConceptLink(root, args, context) {
      const user = await context.prisma.conceptLink({ id: args.id }).createdBy()
      checkAccess(context, { allowStudent: true, verifyUser: true, userId: user.id })
      return context.prisma.deleteConceptLink({
        id: args.id
      })
    }
}

module.exports = ConceptLink