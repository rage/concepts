module.exports = {
  User: {
    workspaceParticipations(root, args, context) {
      return context.prisma.user({
        id: root.id
      }).workspaceParticipations()
    },
    projectParticipations(root, args, context) {
      return context.prisma.user({
        id: root.id
      }).projectParticipations()
    }
  }
}
