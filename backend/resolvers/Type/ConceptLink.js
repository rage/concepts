module.exports = {
  ConceptLink: {
    to(root, args, context) {
      return context.prisma.conceptLink({
        id: root.id
      }).to()
    },
    from(root, args, context) {
      return context.prisma.conceptLink({
        id: root.id
      }).from()
    },
    createdBy(root, args, context) {
      return context.prisma.conceptLink({
        id: root.id
      }).createdBy()
    },
    workspace(root, args, context) {
      return context.prisma.conceptLink({
        id: root.id
      }).workspace()
    }
  }
}