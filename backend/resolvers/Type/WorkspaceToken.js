module.exports = {
  WorkspaceToken: {
    participants(root, args, context) {
      return context.prisma.workspace({
          id: root.id
       }).participants()
    }
  }
}