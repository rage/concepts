module.exports = {
  User: {
    asWorkspaceOwner(root, args, context) {
      return context.prisma.user({
        id: root.id
      }).asWorkspaceOwner()
    },
    asProjectOwner(root, args, context) {
      return context.prisma.user({
        id: root.id
      }).asProjectOwner()
    },
    asProjectParticipant(root, args, context) {
      return context.prisma.user({
        id: root.id
      }).asProjectParticipant()
    }
  }
}