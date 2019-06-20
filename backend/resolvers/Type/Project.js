module.exports = {
  Project: {
    owner(root, args, context) {
      return context.prisma.project({
        id: root.id
      }).owner()
    },
    participants(root, args, context) {
      return context.prisma.project({
        id: root.id
      }).participants()
    },
    workspaces(root, args, context) {
      return context.prisma.project({
        id: root.id
      }).workspaces()
    },
    template(root, args, context) {
      return context.prisma.project({
        id: root.id
      }).template()
    }
  }
}
