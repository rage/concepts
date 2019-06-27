module.exports = {
  Resource: {
    urls(root, args, context) {
      return context.prisma.resource({
        id: root.id
      }).urls()
    }
  }
}