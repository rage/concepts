const { prisma } = require('./generated/prisma-client')
const { GraphQLServer } = require('graphql-yoga')

const resolvers = {
  Query: {
    allCourses(root, args, context) {
      return context.prisma.courses()
    },
    allUsers(root, args, context) {
      return context.prisma.users()
    }
  },
  Mutation: {
    createUser(root, args, context) {
      return context.prisma.createUser({ username: args.username })
    },
    createCourse(root, args, context) {
      return context.prisma.createCourse({ name: args.name })
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