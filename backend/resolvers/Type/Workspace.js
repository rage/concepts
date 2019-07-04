module.exports = {
  Workspace: {
    owner(root, args, context) {
      return context.prisma.workspace({
        id: root.id
      }).owner()
    },
    defaultCourse(root, args, context) {
      return context.prisma.workspace({
        id: root.id
      }).defaultCourse()
    },
    project(root, args, context) {
      return context.prisma.workspace({
        id: root.id
      }).project()
    },
    courses(root, args, context) {
      return context.prisma.workspace({
        id: root.id
      }).courses()
    },
    conceptLinks(root, args, context) {
      return context.prisma.workspace({
        id: root.id
      }).conceptLinks()
    },
    courseLinks(root, args, context) {
      return context.prisma.workspace({
        id: root.id
      }).courseLinks()
    },
    concepts(root, args, context) {
      return context.prisma.workspace({
        id: root.id
      }).concepts()
    }
  }
}
