const path = require('path')

require('dotenv').config({
  path: path.resolve(__dirname, `./config/${process.env.ENVIRONMENT}.env`)
})

const { prisma } = require('./generated/prisma-client')
const { GraphQLServer } = require('graphql-yoga')
const express = require('express')

const { authenticate } = require('./middleware/authentication')

const queries = require('./resolvers/Query')
const mutations = require('./resolvers/Mutation')
const types = require('./resolvers/Type')

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
  formatError: error => {
    const errorData = {
      'message': error['message'],
      'path': error['path'].reduce((first, second) => first + '/' + second, ''),
      'now': new Date(Date.now()).toISOString().replace(/T/, ' ').replace(/\..+/, '')
    }

    if (typeof error['extensions'] !== 'undefined') {
      errorData.code = error['extensions']['code']
      console.error(errorData['now'], '--- Code:\x1b[31m\'' + errorData['code'] + '\'\x1b[0m, Path: ' +  errorData['path'] + ', Message: \x1b[31m\'' + errorData['message'] + '\'\x1b[0m')
    } else if (typeof error['locations'] !== 'undefined') {
      console.error(errorData['now'], '--- Path: ' +  errorData['path'] + ', Message: \x1b[31m\'' + errorData['message'] + '\'\x1b[0m')
    }

    return error
  }

}

const server = new GraphQLServer({
  typeDefs: './schema.graphql',
  resolvers,
  context: req => ({
    prisma,
    ...req
  }),
  middlewares: [authenticate]
})

if (process.env.ENVIRONMENT === 'production') {
  server.express.use(express.static('../frontend/build'))

  server.express.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/../frontend/build/index.html'))
  })
}

server.start(options, () => console.log(`Server is running on http://localhost:${process.env.PORT || 4000}`))
