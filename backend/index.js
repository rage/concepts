const { prisma } = require('./generated/prisma-client')
const { GraphQLServer } = require('graphql-yoga')

const resolvers = {
  Query: {
    allCourses(root, args, context) {
      return context.prisma.courses({})
    },
  },
  Mutation: {
    createUser(root, args, context) {
      return context.prisma.createUser({ name: args.username })
    },
  },
  User: {

  },
  Course: {

  },
}

const server = new GraphQLServer({
  typeDefs: './schema.graphql',
  resolvers,
  context: {
    prisma,
  },
})
server.start(() => console.log('Server is running on http://localhost:4000'))