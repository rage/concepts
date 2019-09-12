const path = require('path')

require('dotenv').config({
  path: path.resolve(__dirname, `../config/${process.env.ENVIRONMENT}.env`)
})

const { GraphQLServer } = require('graphql-yoga')
const express = require('express')

const { prisma } = require('../schema/generated/prisma-client')
const { authenticate } = require('./middleware/authentication')
const { logError } = require('./errorLogger')
const queries = require('./resolvers/Query')
const mutations = require('./resolvers/Mutation')
const types = require('./resolvers/Type')
const pointsAPI = require('./pointsAPI')

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

const server = new GraphQLServer({
  typeDefs: './schema/generated/schema.graphql',
  resolvers,
  context: req => ({
    prisma,
    ...req
  }),
  middlewares: [authenticate]
})

// Points for completions
server.express.get('/projects/:pid/courses/:cid/progress', pointsAPI)

if (process.env.ENVIRONMENT === 'production' || process.env.FRONTEND_PATH) {
  const FRONTEND_PATH = process.env.FRONTEND_PATH || path.join(__dirname, '../../frontend/build')
  server.express.use(express.static(FRONTEND_PATH))

  server.express.get('*', (req, res) => {
    res.sendFile(path.join(FRONTEND_PATH, 'index.html'))
  })
}

server.start(options, () =>
  console.log(`Server is running on http://localhost:${process.env.PORT || 4000}`))
