module.exports = {
  WorkspaceParticipant: {
    workspace(root, args, context) {
      return context.prisma.workspaceParticipant({
        id: root.id
      }).workspace()
    },
    token(root, args, context) {
      return context.prisma.workspaceParticipant({
        id: root.id
      }).token()
    },
    user(root, args, context) {
      return context.prisma.workspaceParticipant({
        id: root.id
      }).user()
    }
  }
}
