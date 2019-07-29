module.exports = {
  Course: {
    concepts(root, args, context) {
      return context.prisma.course({
        id: root.id
      }).concepts()
    },
    linksToCourse(root, args, context) {
      return context.prisma.course({
        id: root.id
      }).linksToCourse()
    },
    linksFromCourse(root, args, context) {
      return context.prisma.course({
        id: root.id
      }).linksFromCourse()
    },
    createdBy(root, args, context) {
      return context.prisma.course({
        id: root.id
      }).createdBy()
    },
    workspace(root, args, context) {
      return context.prisma.course({
        id: root.id
      }).workspace()
    }
  }
}
