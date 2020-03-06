import crypto from 'crypto'

import { ForbiddenError } from 'apollo-server-core'

import { Role, Privilege, checkAccess } from '../../util/accessControl'
import { NotFoundError } from '../../util/errors'
import makeSecret from '../../util/secret'
import pubsub from '../Subscription/pubsub'
import { PROJECT_WORKSPACE_CREATED } from '../Subscription/channels'

const workspaceDataForMerge = `
query($id: ID!) {
  project(where: { id: $id }) {
    activeTemplate {
      id
      name
      clones {
        courses {
          id
          name
          official
          frozen
          linksToCourse {
            weight
            official
            frozen
            from {
              name
            }
          }
          concepts {
            id
            name
            description
            level
            official
            frozen
            linksToConcept {
              id
              weight
              official
              frozen
              text
              from {
                name
                course {
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
  concepts(where: { id_in: $conceptIds }) {
    id
    name
    description
    level
    official
    frozen
    linksFromConcept {
      id
      to {
        id
      }
      official
      frozen
      weight
      text
      count
    }
    linksToConcept {
      id
      from {
        id
      }
      official
      frozen
      weight
      text
      count
    }
    course {
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

export const mergeWorkspaces = async (root, { projectId }, context) => {
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
      const updatedLink = setDefault(merged, link.from.name, {
        course: link.from.course ? link.from.course.name : undefined,
        // TODO merge conflicting texts?
        text: link.text,
        weight: 0,
        count: 0
      })
      updatedLink.weight += link.weight
      updatedLink.count++
      updatedLink.official = updatedLink.official || link.official
      updatedLink.frozen = updatedLink.frozen || link.frozen
    }
  }

  const name = `${result.project.activeTemplate.name} merge`
  const templateId = result.project.activeTemplate.id

  const courses = {}

  for (const workspace of result.project.activeTemplate.clones) {
    for (const course of workspace.courses) {
      const updatedCourse = setDefault(courses, course.name, {
        official: course.official,
        frozen: course.frozen,
        links: {},
        concepts: {}
      })
      updatedCourse.official = updatedCourse.official || course.official
      updatedCourse.frozen = updatedCourse.frozen || course.frozen

      mergeLinks(course.linksToCourse, updatedCourse.links)

      for (const concept of course.concepts) {
        // TODO merge conflicting descriptions?
        // TODO separate conflicting levels?
        const updatedConcept = setDefault(updatedCourse.concepts, concept.name, {
          description: concept.description,
          level: concept.level,
          official: concept.official,
          frozen: concept.frozen,
          course: course.name,
          links: {},
          count: 0
        })
        updatedConcept.count++
        updatedConcept.official = updatedConcept.official || concept.official
        updatedConcept.frozen = updatedConcept.frozen || concept.frozen

        mergeLinks(concept.linksToConcept, updatedConcept.links)
      }
    }
  }

  const workspaceId = hash()
  const mergedWorkspace = await context.prisma.createWorkspace({
    id: workspaceId,
    name,
    createdBy: { connect: { id: context.user.id } },
    asMerge: { connect: { id: projectId } },
    sourceTemplate: { connect: { id: templateId } },
    participants: {
      create: [{
        privilege: Privilege.OWNER.toString(),
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
            create: Object.entries(concepts).map(([name, {
              level, official, description, count
            }]) => ({
              id: hash(courseName, name),
              name,
              description,
              official,
              level,
              count,
              createdBy: { connect: { id: context.user.id } },
              workspace: { connect: { id: workspaceId } }
            }))
          }
        }))
    },
    courseLinks: {
      create: Object.entries(courses)
        .flatMap(([toCourse, { links }]) => Object.entries(links)
          .map(([fromCourse, { text, weight, count }]) => ({
            createdBy: { connect: { id: context.user.id } },
            from: { connect: { id: hash(fromCourse) } },
            to: { connect: { id: hash(toCourse) } },
            weight: Math.round(weight / count),
            text,
            count
          }))
        )
    },
    conceptLinks: {
      create: Object.entries(courses)
        .flatMap(([toCourse, { concepts }]) => Object.entries(concepts)
          .flatMap(([toConcept, { links }]) => Object.entries(links)
            .map(([fromConcept, { course: fromCourse, weight, count }]) => ({
              createdBy: { connect: { id: context.user.id } },
              from: { connect: { id: hash(fromCourse, fromConcept) } },
              to: { connect: { id: hash(toCourse, toConcept) } },
              weight: Math.round(weight / count),
              count
            }))
          )
        )
    }
  })

  pubsub.publish(PROJECT_WORKSPACE_CREATED, {
    projectWorkspaceCreated: {
      pId: projectId,
      mergedWorkspace
    }
  })

  return mergedWorkspace
}
export const mergeConcepts = async (root, {
  workspaceId, conceptIds, courseId, name, description, official, frozen, tags
}, context) => {
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

  const generateLinks = (src, type) => {
    const data = Object.values(concepts).flatMap(concept => concept[`links${src}Concept`])
      .filter(item => !conceptIds.includes(item[type].id))
    const linksMap = {}
    for (const link of data) {
      const key = link[type].id
      const updatedLink = setDefault(linksMap, key, {
        [type]: { connect: { id: link[type].id } },
        official: official && link.official,
        frozen: frozen && link.frozen,
        weight: 0,
        count: 0,
        workspace: { connect: { id: workspaceId } },
        createdBy: { connect: { id: context.user.id } }
      })
      updatedLink.weight += link.weight
      updatedLink.count += link.count
    }
    return Object.values(linksMap).map(link => ({
      ...link, weight: Math.round(link.weight / link.count)
    }))
  }

  return await context.prisma.createConcept({
    name,
    description,
    official,
    tags: { create: tags },
    linksFromConcept: { create: generateLinks('From', 'to') },
    linksToConcept: { create: generateLinks('To', 'from') },

    createdBy: { connect: { id: context.user.id } },
    workspace: { connect: { id: workspaceId } },
    course: { connect: { id: courseId } }
  })
}
