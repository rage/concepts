const crypto = require('crypto')

const { Role, Privilege, checkAccess } = require('../../accessControl')
const { NotFoundError } = require('../../errors')
const makeSecret = require('../../secret')

const clonedWorkspacesQuery = `
query($id : ID!) {
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
  return sha1.digest('base64').replace('/', '_').replace('+', '-')
}

const MergeMutations = {
  async mergeWorkspaces(root, { projectId }, context) {
    await checkAccess(context, {
      minimumRole: Role.GUEST,
      minimumPrivilege: Privilege.EDIT,
      projectId
    })

    const result = await context.prisma.$graphql(clonedWorkspacesQuery, {
      id: projectId
    })
    if (!result.project.activeTemplate) {
      throw new NotFoundError('activeTemplate')
    }

    const seed = makeSecret(32)
    const hash = (...vars) => sha1digest(seed, ...vars).substr(0, 25)

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
          links: {},
          concepts: {}
        })

        mergeLinks(course.linksToCourse, courseLinks)

        for (const concept of course.concepts) {
          // TODO merge conflicting descriptions?
          const { links: conceptLinks } = setDefault(concepts, concept.name, {
            description: concept.description,
            course: course.name,
            links: {}
          })

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
          .map(([courseName, { concepts }]) => ({
            id: hash(courseName),
            name: courseName,
            createdBy: { connect: { id: context.user.id } },
            concepts: {
              create: Object.entries(concepts).map(([name, { description }]) => ({
                id: hash(courseName, name),
                name,
                description,
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
  }
}

module.exports = MergeMutations
