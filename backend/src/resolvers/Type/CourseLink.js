module.exports = {
  CourseLink: {
    to(root, args, context) {
      return context.prisma.courseLink({
        id: root.id
      }).to()
    },
    from(root, args, context) {
      return context.prisma.courseLink({
        id: root.id
      }).from()
    },
    createdBy(root, args, context) {
      return context.prisma.courseLink({
        id: root.id
      }).createdBy()
    },
    workspace(root, args, context) {
      return context.prisma.courseLink({
        id: root.id
      }).workspace()
    }
  }
}
