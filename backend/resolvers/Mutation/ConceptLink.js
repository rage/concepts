const { checkAccess } = require('../../accessControl')

const ConceptLink = {
  createConceptLink(root, { official, to, from, workspaceId }, context) {
    checkAccess(context, { allowStudent: true, allowStaff: true })
    let data = {
      to: {
        connect: { id: to }
      },
      from: {
        connect: { id: from }
      },
      createdBy: {
        connect: { id: context.user.id }
      },
      workspace: {
        connect: { id: workspaceId }
      }
    }
    if (official !== undefined) data.official = official

    return context.prisma.createConceptLink(data)
  },
  async createConceptLinks(root, { official, to, from, workspaceId }, context) {
    checkAccess(context, { allowStudent: true, allowStaff: true })
    return await from.map(async fromConceptId =>
      await context.prisma.createConceptLink({
        to: {
          connect: { id: to }
        },
        from: {
          connect: { id: fromConceptId }
        },
        createdBy: {
          connect: { id: context.user.id }
        },
        workspace: {
          connect: { id: workspaceId }
        },
        official: official !== undefined
      })
    )
  },
  async deleteConceptLinks(root, args, context) {
    checkAccess(context, { allowStudent: true, allowStaff: true })
    const data = await context.prisma.conceptLinks({
      where: {
        AND: [
          { id_in: args.ids },
          { createdBy: { id: context.user.id } }
        ]
      }
    })
    await context.prisma.deleteManyConceptLinks({
      AND: [
        { id_in: args.ids },
        { createdBy: { id: context.user.id } }
      ]
    })
    return data
  },
  async deleteConceptLink(root, args, context) {
    const user = await context.prisma.conceptLink({ id: args.id }).createdBy()
    checkAccess(context, { allowStudent: true, allowStaff: true, verifyUser: true, userId: user.id })
    return context.prisma.deleteConceptLink({
      id: args.id
    })
  }
}

module.exports = ConceptLink