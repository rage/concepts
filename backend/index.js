const path = require('path')

require('dotenv').config({
  path: path.resolve(__dirname, `./config/${process.env.ENVIRONMENT}.env`)
})

const { prisma } = require('./generated/prisma-client')
const { GraphQLServer } = require('graphql-yoga')
const express = require("express")

const { checkAccess } = require('./accessControl')
const { authenticate } = require('./middleware/authentication')

const queries = require('./resolvers/Query')
const mutations = require('./resolvers/Mutation')

const resolvers = {
  Query: {
    ...queries
  },
  Mutation: {
    ...mutations
  },
  Concept: {
    linksToConcept(root, args, context) {
      return context.prisma.concept({
        id: root.id
      }).linksToConcept()
    },
    linksFromConcept(root, args, context) {
      return context.prisma.concept({
        id: root.id
      }).linksFromConcept()
    },
    courses(root, args, context) {
      return context.prisma.concept({
        id: root.id
      }).courses()
    },
    resources(root, args, context) {
      return context.prisma.concept({
        id: root.id
      }).resources()
    },
    createdBy(root, args, context) {
      return context.prisma.concept({
        id: root.id
      }).createdBy()
    },
    workspace(root, args, context) {
      return context.prisma.concept({
        id: root.id
      }).workspace()
    }
  },
  ConceptLink: {
    to(root, args, context) {
      return context.prisma.conceptLink({
        id: root.id
      }).to()
    },
    from(root, args, context) {
      return context.prisma.conceptLink({
        id: root.id
      }).from()
    },
    createdBy(root, args, context) {
      return context.prisma.conceptLink({
        id: root.id
      }).createdBy()
    },
    workspace(root, args, context) {
      return context.prisma.conceptLink({
        id: root.id
      }).workspace()
    }
  },
  CourseLink: {
    to(root, args, context) {
      return context.prisma.courseLink({
        id: root.id
      }).to()
    },
    from(root, args, context) {
      return context.prisma.courseLink({
        id: root.id
      }).from()
    },
    createdBy(root, args, context) {
      return context.prisma.courseLink({
        id: root.id
      }).createdBy()
    },
    workspace(root, args, context) {
      return context.prisma.courseLink({
        id: root.id
      }).workspace()
    }
  },
  Course: {
    concepts(root, args, context) {
      return context.prisma.course({
        id: root.id
      }).concepts()
    },
    linksToCourse(root, args, context) {
      return context.prisma.course({
        id: root.id
      }).linksToCourse()
    },
    linksFromCourse(root, args, context) {
      return context.prisma.course({
        id: root.id
      }).linksFromCourse()
    },
    createdBy(root, args, context) {
      return context.prisma.course({
        id: root.id
      }).createdBy()
    },
    workspace(root, args, context) {
      return context.prisma.course({
        id: root.id
      }).workspace()
    }
  },
  Resource: {
    urls(root, args, context) {
      return context.prisma.resource({
        id: root.id
      }).urls()
    }
  },
  URL: {
    resource(root, args, context) {
      return context.prisma.uRL({
        id: root.id
      }).resource()
    }
  },
  Workspace: {
    owner(root, args, context) {
      return context.prisma.workspace({ 
        id: root.id
      }).owner()
    },
    defaultCourse(root, args, context) {
      return context.prisma.workspace({
        id: root.id
      }).defaultCourse()
    },
    project(root, args, context) {
      return context.prisma.workspace({
        id: root.id
      }).project()
    },
    courses(root, args, context) {
      return context.prisma.workspace({
        id: root.id
      }).courses()
    },
    conceptLinks(root, args, context) {
      return context.prisma.workspace({
        id: root.id
      }).conceptLinks()
    },
    courseLinks(root, args, context) {
      return context.prisma.workspace({
        id: root.id
      }).courseLinks()
    },
    concepts(root, args, context) {
      return context.prisma.workspace({
        id: root.id
      }).concepts()
    }
  },
  Project: {
    owner(root, args, context) {
      return context.prisma.project({
        id: root.id
      }).owner()
    },
    participants(root, args, context) {
      return context.prisma.project({
        id: root.id
      }).participants()
    },
    workspaces(root, args, context) {
      return context.prisma.project({
        id: root.id
      }).workspaces()
    },
    template(root, args, context) {
      return context.prisma.project({
        id: root.id
      }).template()
    }
  }
}

const options = {
  endpoint: '/graphql',
  playground: '/playground',
  port: process.env.PORT || 4000
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