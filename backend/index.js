const { prisma } = require('./generated/prisma-client')
const { GraphQLServer } = require('graphql-yoga')

const resolvers = {
  Query: {
    allCourses(root, args, context) {
      return context.prisma.courses()
    },
    allConcepts(root, args, context) {
      return context.prisma.concepts()
    },
    conceptById(root, args, context) {
      return context.prisma.concept({ id: args.id })
    },
    allLinks(root, args, context) {
      return context.prisma.links()
    },
    linksToConcept(root, args, context) {
      return context.prisma.concept({ id: args.id }).to()
    },
    linksFromConcept(root, args, context) {
      return context.prisma.concept({ id: args.id }).from()
    },
  },
  Mutation: {
    createCourse(root, args, context) {
      return context.prisma.createCourse({ name : args.name })
    },
    deleteCourse(root, args, context) {
      return context.prisma.deleteCourse({ id: args.id })
    },
    createConcept(root, args, context) {
      const concept = args.desc !== undefined
        ? args.official !== undefined
          ? { name: args.name, description: args.desc, official: args.official }
          : { name: args.name, description: args.desc }
        : args.official !== undefined
          ? { name: args.name, official: args.official }
          : { name: args.name }
      return context.prisma.createConcept(concept)
    },
    updateConcept(root, args, context) {
      return context.prisma.updateConcept({
        where: { id: args.id },
        data: { name: args.name, description: args.desc }
      })
    },
    async createConceptAndLinkTo(root, args, context) {
      const concept = args.desc !== undefined
        ? args.official !== undefined
          ? { name: args.name, description: args.desc, official: args.official }
          : { name: args.name, description: args.desc }
        : args.official !== undefined
          ? { name: args.name, official: args.official }
          : { name: args.name }
      const createdConcept = await context.prisma.createConcept(concept)

      // Link created concept to specified concept
      return args.linkOfficial !== undefined
        ? context.prisma.createLink({
          to: { connect: { id: args.to } },
          from: { connect: { id: createdConcept.id, } },
          official: args.linkOfficial
        })
        : context.prisma.createLink({
          to: { connect: { id: args.to } },
          from: { connect: { id: createdConcept.id } }
        })
    },
    deleteConcept(root, args, context) {
      return context.prisma.deleteConcept({ id: args.id })
    },
    createLink(root, args, context) {
      return args.official !== undefined
        ? context.prisma.createLink({
          to: {
            connect: { id: args.to }
          },
          from: {
            connect: { id: args.from, }
          },
          official: args.official
        })
        : context.prisma.createLink({
          to: {
            connect: { id: args.to }
          },
          from: {
            connect: { id: args.from }
          }
        })
    },
    deleteLink(root, args, context) {
      return context.prisma.deleteLink({ id: args.id })
    }
  },
  Concept: {
    linksToConcept(root, args, context) {
      return context.prisma.concept({ id: root.id }).linksToConcept()
    },
    linksFromConcept(root, args, context) {
      return context.prisma.concept({ id: root.id }).linksFromConcept()
    },
  },
  Link: {
    to(root, args, context) {
      return context.prisma.link({ id: root.id }).to()
    },
    from(root, args, context) {
      return context.prisma.link({ id: root.id }).from()
    }
  }
}

const options = {
  endpoint: '/graphql',
  playground: '/playground'
}

const server = new GraphQLServer({
  typeDefs: './schema.graphql',
  resolvers,
  context: {
    prisma,
  },
})
server.start(options, () => console.log('Server is running on http://localhost:4000'))