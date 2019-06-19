const { checkAccess } = require('../../accessControl')

const ConceptLink = {
    createConceptLink(root, { official, to, from }, context) {
      checkAccess(context, { allowStudent: true })
      let data = {
        to: {
          connect: { id: to }
        },
        from: {
          connect: { id: from, }
        },
        createdBy: {
          connect: { id: context.user.id }
        }
      }
      if (official !== undefined) data.official = official

      return context.prisma.createConceptLink(data)
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