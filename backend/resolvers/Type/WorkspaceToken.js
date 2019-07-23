module.exports = {
  WorkspaceToken: {
    participants(root, args, context) {
      return context.prisma.workspaceToken({
        id: root.id
      }).participants()
    },
    workspace(root, args, context) {
      return context.prisma.workspaceToken({
        id: root.id
      }).workspace()
    }
  }
}
