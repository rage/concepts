import path from 'path'

import { GraphQLServer } from 'graphql-yoga'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import './util/titleCase'
import { prisma } from '../schema/generated/prisma-client'
import { authenticate } from './middleware/authentication'
import { logError } from './util/errorLogger'
import resolvers from './resolvers'
import { progressAPI, pointsAPI } from './controllers/pointsAPI'
import { exportAPI, markdownExportAPI } from './controllers/exportAPI'
import { loginAPIRedirect, loginAPIAssert, loginAPIMetadata } from './controllers/loginAPI'

const options = {
  endpoint: '/graphql',
  playground: '/playground',
  subscriptions: '/subscription',
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
server.express.get('/api/projects/:pid/courses/:cid/progress', cors(), progressAPI)
server.express.get('/api/projects/:pid/points', cors(), pointsAPI)
server.express.get('/api/workspace/:wid/export', cors(), exportAPI)
server.express.get('/api/workspace/:wid/markdown', cors(), markdownExportAPI)

// SAML API for Haka login
server.express.use(express.urlencoded({ extended: true }))
server.express.use(cookieParser())
server.express.get('/api/login', loginAPIRedirect)
server.express.post('/api/login/assert', loginAPIAssert)
server.express.post('/api/login/metadata', loginAPIMetadata)

if (process.env.ENVIRONMENT === 'production' || process.env.FRONTEND_PATH) {
  const FRONTEND_PATH = process.env.FRONTEND_PATH || path.join(__dirname, '../../frontend/build')
  server.express.use(express.static(FRONTEND_PATH))

  server.express.get('*', (req, res) => {
    res.sendFile(path.join(FRONTEND_PATH, 'index.html'))
  })
}

server.start(options, () =>
  console.log(`Server is running on http://localhost:${process.env.PORT || 4000}`))
