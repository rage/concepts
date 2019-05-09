const { prisma } = require('./generated/prisma-client')
const { GraphQLServer } = require('graphql-yoga')

const resolvers = {
  Query: {
    async allConcepts(root, args, context) {
      return await context.prisma.concepts()
    },
    async conceptById(root, args, context) {
      return await context.prisma.concept({ id: args.id })
    }
  },
  Mutation: {
    async createConcept(root, args, context) {
      const concept = args.desc !== undefined
        ? args.official !== undefined
          ? { name: args.name, description: args.desc, official: args.official }
          : { name: args.name, description: args.desc }
        : args.official !== undefined
          ? { name: args.name, official: args.official }
          : { name: args.name }
      return await context.prisma.createConcept(concept)
    },
    async deleteConcept(root, args, context) {
      return await context.prisma.deleteConcept({ id: args.id })
    }
  },
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