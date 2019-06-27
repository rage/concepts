module.exports = {
  Concept: {
    linksToConcept(root, args, context) {
      return context.prisma.concept({
        id: root.id
      }).linksToConcept()
    },
    linksFromConcept(root, args, context) {
      return context.prisma.concept({
        id: root.id
      }).linksFromConcept()
    },
    courses(root, args, context) {
      return context.prisma.concept({
        id: root.id
      }).courses()
    },
    resources(root, args, context) {
      return context.prisma.concept({
        id: root.id
      }).resources()
    },
    createdBy(root, args, context) {
      return context.prisma.concept({
        id: root.id
      }).createdBy()
    },
    workspace(root, args, context) {
      return context.prisma.concept({
        id: root.id
      }).workspace()
    }
  }
}