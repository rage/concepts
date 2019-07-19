const path = require('path')

require('dotenv').config({
  path: path.resolve(__dirname, `./config/${process.env.ENVIRONMENT}.env`)
})

const { prisma } = require('./generated/prisma-client')
const { GraphQLServer } = require('graphql-yoga')
const express = require('express')

const datamodelInfo = require("./generated/nexus-prisma")
const { makePrismaSchema, prismaObjectType } = require('nexus-prisma')
const { authenticate } = require('./middleware/authentication')
const { logError } = require('./errorLogger')

const queries = require('./resolvers/Query')
const mutations = require('./resolvers/Mutation')
const types = require('./resolvers/Type')

const { rule, shield, and, or, not } = require('graphql-shield')

const Query = prismaObjectType({
  name: "Query",
  definition: (type) => type.prismaFields(['*'])
})

const Mutation = prismaObjectType({
  name: "Mutation",
  definition: (type) => type.prismaFields(['*'])
})

const schema = makePrismaSchema({
  types: [Query, Mutation],
  prisma: {
    datamodelInfo,
    client: prisma
  },
  outputs: {
    schema: path.join(__dirname, "./generated/schema.graphql"),
    typegen: path.join(__dirname, "./generated/nexus.d.ts"),
  }
})

const resolvers = {
  Query: {
    ...queries
  },
  Mutation: {
    ...mutations
  },
  ...types
}

const options = {
  endpoint: '/graphql',
  playground: '/playground',
  port: process.env.PORT || 4000,
  formatError: logError
}

const Role = {
  VISITOR: 'VISITOR',
  GUEST: 'GUEST',
  STUDENT: 'STUDENT',
  STAFF: 'STAFF',
  ADMIN: 'ADMIN'
}

const isAdmin = rule()(async (parent, args, ctx, info) => {
  return ctx.role === Role.ADMIN
})

const isGuest = rule()(async (parent, args, ctx, info) => {
  return ctx.role === Role.GUEST
})

const isStudent = rule()(async (parent, args, ctx, info) => {
  return ctx.role === Role.STUDENT
})

const isStaff = rule()(async (parent, args, ctx, info) => {
  return ctx.role === Role.STAFF
})

const isVisitor = rule()(async (parent, args, ctx, info) => {
  return ctx.role === Role.VISITOR
})

const permissions = shield({
  Query: {
  },
  Mutation: {
  },
  User: isAdmin,
})

const server = new GraphQLServer({
  typeDefs: './generated/schema.graphql',
  schema,
  context: req => ({
    prisma,
    ...req
  }),
  middlewares: [authenticate, permissions]
})

if (process.env.ENVIRONMENT === 'production') {
  server.express.use(express.static('../frontend/build'))

  server.express.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/../frontend/build/index.html'))
  })
}

server.start(options, () =>
  console.log(`Server is running on http://localhost:${process.env.PORT || 4000}`))
