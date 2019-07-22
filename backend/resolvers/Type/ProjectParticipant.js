module.exports = {
  ProjectParticipant: {
    project(root, args, context) {
      return context.prisma.projectParticipant({
        id: root.id
      })
    },
    token(root, args, context) {
      return context.prisma.projectParticipant({
        id: root.id
      }).token()
    },
    user(root, args, context) {
      return context.prisma.projectParticipant({
        id: root.id
      }).user()
    }
  }
}