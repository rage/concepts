const { checkAccess } = require('../../accessControl')

const ConceptMutations = {
  async createConcept(root, { name, description, official, courseId, workspaceId }, context) {
    checkAccess(context, { allowGuest:true, allowStudent: true, allowStaff: true })
    const data = {
      name,
      createdBy: { connect: { id: context.user.id } },
      workspace: { connect: { id: workspaceId } }
    }
    if (description !== undefined) data.description = description
    if (official !== undefined) data.official = official
    if (courseId !== undefined) data.courses = { connect: [{ id: courseId }] }

    return context.prisma.createConcept(data)
  },

  async updateConcept(root, { id, name, description }, context) {
    const user = await context.prisma.concept({ id }).createdBy()
    checkAccess(context, {
      allowGuest: true, allowStudent: true, allowStaff: true, verifyUser: true, userId: user.id
    })
    const data = {}
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
    checkAccess(context, {
      allowGuest: true, allowStudent: true, allowStaff: true, verifyUser: true, userId: user.id
    })
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
