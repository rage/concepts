module.exports = {
  ProjectToken: {
    participants(root, args, context) {
      return context.prisma.project({
          id: root.id
       }).participants()
    }
  }
}