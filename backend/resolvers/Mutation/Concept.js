const { checkAccess, checkUser } = require('../../accessControl')

const ConceptMutations = {
    createConcept(root, { name, description, official, courseId, workspaceId }, context) {
      checkAccess(context, { allowStudent: true })

      let data = { 
        name,
        createdBy: { connect: { id: context.user.id }},
        workspace: { connect: { id : workspaceId }}
      }
      if (description !== undefined) data.description = description 
      if (official !== undefined) data.official = official
      if (courseId !== undefined) data.courses = { connect: [{ id: courseId }] }

      return context.prisma.createConcept(data)
    },
    updateConcept(root, { id, name, description}, context) {
      checkAccess(context, { allowStudent: true })
      let data = {}
      if (name !== undefined) data.name = name
      if (description !== undefined) data.description = description

      return context.prisma.updateConcept({
        where: { id },
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