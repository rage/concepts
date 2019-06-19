const { checkAccess, checkUser } = require('../../accessControl')

const ConceptMutations = {
    createConcept(root, args, context) {
      checkAccess(context, { allowStudent: true })

      const concept = args.desc !== undefined
        ? args.official !== undefined
          ? { name: args.name, description: args.desc, official: args.official }
          : { name: args.name, description: args.desc }
        : args.official !== undefined
          ? { name: args.name, official: args.official }
          : { name: args.name }

      return context.prisma.createConcept({
        ...concept,
        courses: { connect: [{ id: args.course_id }] },
        createdBy: { connect: { id: context.user.id }}
      })
    },
    updateConcept(root, args, context) {
      checkAccess(context, { allowStudent: true })
      let data = {}
      if (args.name !== undefined) {
        data.name = args.name
      }
      if (args.desc !== undefined) {
        data.description = args.desc
      }
      return context.prisma.updateConcept({
        where: { id: args.id },
        data: data
      })
    },
    async deleteConcept(root, args, context) {
      const user = await context.prisma.concept({
        id: args.id 
      }).createdBy()
      checkAccess(context, { allowStudent: true, verifyUser: true, userId: user.id })
      await context.prisma.deleteManyConceptLinks({
        OR: [
          {
            from: {
              id: args.id
            }

          },
          {
            to: {
              id: args.id
            }
          }
        ]

      })
      return context.prisma.deleteConcept({
        id: args.id
      })
    }
}

module.exports = ConceptMutations