module.exports = {
  ProjectToken: {
    participants(root, args, context) {
      return context.prisma.projectToken({
        id: root.id
      }).participants()
    },
    project(root, args, context) {
      return context.prisma.projectToken({
        id: root.id
      }).project()
    }
  }
}
