const { prisma } = require('./generated/prisma-client')
const { GraphQLServer } = require('graphql-yoga')
const express = require("express")

require('dotenv').config()

const resolvers = {
  Query: {
    allURLs(root, args, context) {
      return context.prisma.uRLs()
    },
    allResources(root, args, context) {
      return context.prisma.resources()
    },
    allCourses(root, args, context) {
      return context.prisma.courses()
    },
    courseById(root, args, context) {
      return context.prisma.course({
        id: args.id
      })
    },
    allConcepts(root, args, context) {
      return context.prisma.concepts()
    },
    conceptById(root, args, context) {
      return context.prisma.concept({
        id: args.id
      })
    },
    allLinks(root, args, context) {
      return context.prisma.links()
    },
    linksToConcept(root, args, context) {
      return context.prisma.concept({
        id: args.id
      }).to()
    },
    linksFromConcept(root, args, context) {
      return context.prisma.concept({
        id: args.id
      }).from()
    },
  },
  Mutation: {
    addCourseAsCoursePrerequisite(root, args, context) {
      return context.prisma.updateCourse({
        where: {id: args.id },
        data: {
          prerequisiteCourses: {
            connect: [{ id: args.prerequisite_id }]
          }
        }
        
      })
    },
    createResourceWithURLs(root, args, context) {
      return context.prisma.createResource({
        name: args.name,
        description: args.desc,
        concept: {
          connect: { id: args.concept_id }
        },
        urls: {
          create: args.urls.map(url => {
            return { address: url }
          })
        }
      })
    },
    createURL(root, args, context) {
      return context.prisma.createURL({
        address: args.address,
        resource: { connect: { id: args.resource_id } }
      })
    },
    createResource(root, args, context) {
      return context.prisma.createResource({
        name: args.name,
        description: args.desc,
        concept: { connect: [{ id: args.concept_id }] }
      })
    },
    createCourse(root, args, context) {
      return context.prisma.createCourse({
        name: args.name
      })
    },
    deleteCourse(root, args, context) {
      return context.prisma.deleteCourse({
        id: args.id
      })
    },
    createConcept(root, args, context) {
      const concept = args.desc !== undefined
        ? args.official !== undefined
          ? { name: args.name, description: args.desc, official: args.official }
          : { name: args.name, description: args.desc }
        : args.official !== undefined
          ? { name: args.name, official: args.official }
          : { name: args.name }

      return context.prisma.createConcept({
        ...concept,
        courses: { connect: [{ id: args.course_id }] }
      })
    },
    createConceptAsPrerequisite(root, args, context) {
      const concept = args.desc !== undefined
        ? args.official !== undefined
          ? { name: args.name, description: args.desc, official: args.official }
          : { name: args.name, description: args.desc }
        : args.official !== undefined
          ? { name: args.name, official: args.official }
          : { name: args.name }

      return context.prisma.createConcept({
        ...concept,
        asPrerequisite: { connect: [{ id: args.course_id }] }
      })
    },
    createConceptAsLearningObjective(root, args, context) {
      const concept = args.desc !== undefined
        ? args.official !== undefined
          ? { name: args.name, description: args.desc, official: args.official }
          : { name: args.name, description: args.desc }
        : args.official !== undefined
          ? { name: args.name, official: args.official }
          : { name: args.name }

      return context.prisma.createConcept({
        ...concept,
        asLearningObjective: { connect: [{ id: args.course_id }] }
      })
    },
    updateConcept(root, args, context) {
      return context.prisma.updateConcept({
        where: { id: args.id },
        data: { name: args.name, description: args.desc }
      })
    },
    updateCourse(root, args, context) {
      return context.prisma.updateCourse({
        where: { id: args.id },
        data: { name: args.name }
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
    async deleteConcept(root, args, context) {
      await context.prisma.deleteManyLinks({
        
          OR: [
            {
              from: {
                id: args.id
              }

            },
            {
              to: {
                id: args.id
              }
            }
          ]
        
       })
      return context.prisma.deleteConcept({
        id: args.id
      })
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
      return context.prisma.deleteLink({
        id: args.id
      })
    }
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
    asPrerequisite(root, args, context) {
      return context.prisma.concept({
        id: root.id
      }).asPrerequisite()
    },
    asLearningObjective(root, args, context) {
      return context.prisma.concept({
        id: root.id
      }).asLearningObjective()
    },
    resources(root, args, context) {
      return context.prisma.concept({
        id: root.id
      }).resources()
    }
  },
  Link: {
    to(root, args, context) {
      return context.prisma.link({
        id: root.id
      }).to()
    },
    from(root, args, context) {
      return context.prisma.link({
        id: root.id
      }).from()
    }
  },
  Course: {
    concepts(root, args, context) {
      return context.prisma.course({
        id: root.id
      }).concepts()
    },
    prerequisiteCourses(root, args, context) {
      return context.prisma.course({
        id: root.id
      }).prerequisiteCourses()
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

server.express.use(express.static('../frontend/build'))

server.start(options, () => console.log('Server is running on http://localhost:4000'))