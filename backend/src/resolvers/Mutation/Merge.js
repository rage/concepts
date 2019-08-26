const crypto = require('crypto')

const { ForbiddenError } = require('apollo-server-core')

const { Role, Privilege, checkAccess } = require('../../accessControl')
const { NotFoundError } = require('../../errors')
const makeSecret = require('../../secret')

const workspaceDataForMerge = `
query($id: ID!) {
  project(where: {
    id: $id
  }) {
    activeTemplate {
      id
      name
      clones {
        courses {
          id
          name
          official
          linksToCourse {
            weight
            from {
              name
            }
          }
          concepts {
            id
            name
            description
            official
            linksToConcept {
              id
              weight
              from {
                name
                courses {
                  name
                }
              }
            }
          }
        }
      }
    }
  }
}
`

const conceptDataForMerge = `
query($conceptIds: [ID!]!) {
  concepts(where: {
    id_in: $conceptIds
  }) {
    id
    name
    description
    official
    linksFromConcept {
      id
      from {
        id
      }
      to {
        id
      }
      official
      weight
    }
    linksToConcept {
      id
      from {
        id
      }
      to {
        id
      }
      official
      weight
    }
    courses {
      id
    }
    workspace {
      id
    }
    tags {
      id
      name
      type
      priority
    }
  }
}
`

const setDefault = (obj, key, val) => {
  if (!obj[key]) {
    obj[key] = val
  }
  return obj[key]
}

const sha1digest = (...vars) => {
  const sha1 = crypto.createHash('sha1')
  for (const item of vars) {
    sha1.update(item)
  }
  // the replaces make it urlsafe base64 (https://tools.ietf.org/html/rfc4648)
  return sha1.digest('base64').replace(/\//g, '_').replace(/\+/g, '-')
}

const MergeMutations = {
  async mergeWorkspaces(root, { projectId }, context) {
    await checkAccess(context, {
      minimumRole: Role.GUEST,
      minimumPrivilege: Privilege.EDIT,
      projectId
    })

    const result = await context.prisma.$graphql(workspaceDataForMerge, {
      id: projectId
    })
    if (!result.project.activeTemplate) {
      throw new NotFoundError('activeTemplate')
    }

    const seed = makeSecret(32)
    const hash = (...vars) => `b${sha1digest(seed, ...vars).substr(0, 24)}`

    const mergeLinks = (links, merged) => {
      for (const link of links) {
        setDefault(merged, link.from.name, {
          course: link.from.courses ? link.from.courses[0].name : undefined,
          weight: 0
        }).weight += link.weight
      }
    }

    const name = `${result.project.activeTemplate.name} merge`
    const templateId = result.project.activeTemplate.id

    const courses = {}

    for (const workspace of result.project.activeTemplate.clones) {
      for (const course of workspace.courses) {
        const { links: courseLinks, concepts } = setDefault(courses, course.name, {
          official: course.official,
          links: {},
          concepts: {}
        })
        if (course.official) courses[course.name].official = course.official

        mergeLinks(course.linksToCourse, courseLinks)

        for (const concept of course.concepts) {
          // TODO merge conflicting descriptions?
          const { links: conceptLinks } = setDefault(concepts, concept.name, {
            description: concept.description,
            official: concept.official,
            course: course.name,
            links: {}
          })
          if (concept.official) concepts[concept.name].official = concept.official

          mergeLinks(concept.linksToConcept, conceptLinks)
        }
      }
    }

    const workspaceId = hash()
    return await context.prisma.createWorkspace({
      id: workspaceId,
      name,
      asMerge: { connect: { id: projectId } },
      sourceTemplate: { connect: { id: templateId } },
      participants: {
        create: [{
          privilege: Privilege.OWNER,
          user: { connect: { id: context.user.id } }
        }]
      },
      courses: {
        create: Object.entries(courses)
          .map(([courseName, { official, concepts }]) => ({
            id: hash(courseName),
            name: courseName,
            official,
            createdBy: { connect: { id: context.user.id } },
            concepts: {
              create: Object.entries(concepts).map(([name, { official, description }]) => ({
                id: hash(courseName, name),
                name,
                description,
                official,
                createdBy: { connect: { id: context.user.id } },
                workspace: { connect: { id: workspaceId } }
              }))
            }
          }))
      },
      courseLinks: {
        create: Object.entries(courses)
          .flatMap(([toCourse, { links }]) => Object.entries(links)
            .map(([fromCourse, { weight }]) => ({
              createdBy: { connect: { id: context.user.id } },
              from: { connect: { id: hash(fromCourse) } },
              to: { connect: { id: hash(toCourse) } },
              weight
            }))
          )
      },
      conceptLinks: {
        create: Object.entries(courses)
          .flatMap(([toCourse, { concepts }]) => Object.entries(concepts)
            .flatMap(([toConcept, { links }]) => Object.entries(links)
              .map(([fromConcept, { course: fromCourse, weight }]) => ({
                createdBy: { connect: { id: context.user.id } },
                from: { connect: { id: hash(fromCourse, fromConcept) } },
                to: { connect: { id: hash(toCourse, toConcept) } },
                weight
              }))
            )
          )
      }
    })
  },
  async mergeConcepts(root, {
    workspaceId, conceptIds, courseId, name, description, official, tags
  }, context) {
    await checkAccess(context, {
      minimumRole: official ? Role.STAFF : Role.GUEST,
      minimumPrivilege: Privilege.EDIT,
      workspaceId
    })

    const result = await context.prisma.$graphql(conceptDataForMerge, {
      conceptIds
    })
    if (!result.concepts) {
      throw new NotFoundError('concepts')
    }
    const concepts = Object.fromEntries(result.concepts.map(concept => [concept.id, concept]))
    for (const conceptId of conceptIds) {
      if (!concepts.hasOwnProperty(conceptId)) {
        throw new NotFoundError('concept', conceptId)
      }
      if (concepts[conceptId].workspace.id !== workspaceId) {
        throw new ForbiddenError("Can't merge concepts in different workspaces")
      }
    }

    await context.prisma.deleteManyConcepts({
      // eslint-disable-next-line camelcase
      id_in: conceptIds
    })

    const links = type => {
      const Type = type.substr(0, 1).toUpperCase() + type.substr(1)
      const data = Object.values(concepts).flatMap(concept => concept[`links${Type}Concept`])
      const ids = data.map(link => link[type].id)
      return data
        .filter((item, index) =>
          ids.indexOf(item[type].id) === index
          && !conceptIds.includes(item[type].id))
        .map(link => ({
          from: { connect: { id: link.from.id } },
          to: { connect: { id: link.to.id } },
          official: official && link.official,
          weight: link.weight,
          workspace: { connect: { id: workspaceId } },
          createdBy: { connect: { id: context.user.id } }
        }))
    }

    return await context.prisma.createConcept({
      name,
      description,
      official,
      tags: { create: tags },
      linksFromConcept: { create: links('from') },
      linksToConcept: { create: links('to') },

      createdBy: { connect: { id: context.user.id } },
      workspace: { connect: { id: workspaceId } },
      courses: { connect: [{ id: courseId }] }
    })
  }
}

module.exports = MergeMutations
