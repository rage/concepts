module.exports = {
  URL: {
    resource(root, args, context) {
      return context.prisma.uRL({
        id: root.id
      }).resource()
    }
  }
}