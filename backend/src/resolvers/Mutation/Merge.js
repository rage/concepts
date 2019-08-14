const crypto = require('crypto')

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

Object.prototype.setDefault = function(key, val) {
  if (!this[key]) {
    this[key] = val
  }
  return this[key]
}

const sha1digest = (...vars) => {
  const sha1 = crypto.createHash('sha1')
  for (const item of vars) {
    sha1.update(item)
  }
  return sha1.digest('base64')
}

const MergeMutations = {
  async mergeWorkspaces(root, { projectId }, context) {
    const activeTemplate = context.prisma.project({
      id: projectId
    }).activeTemplate()
    if (!activeTemplate) {
      throw new Error('No active template found.')
    }
    // TODO check access

    const result = await context.prisma.$graphql(clonedWorkspacesQuery, {
      id: projectId
    })

    const seed = makeSecret(32)
    const hash = (...vars) => sha1digest(seed, ...vars).substr(0, 25)

    const name = `${result.project.activeTemplate.name} merge`
    const templateId = result.project.activeTemplate.id

    const mergedCourses = {}

    for (const workspace of result.project.activeTemplate.clones) {
      for (const course of workspace.courses) {
        const mergedCourse = mergedCourses.setDefault(course.name, {
          links: {},
          concepts: {}
        })

        const mergeLinks = (name, links, merged) => {
          for (const link of links) {
            merged.setDefault(link.from.name, {
              course: link.from.courses ? link.from.courses[0].name : undefined,
              weight: 0
            }).weight++
          }
        }

        mergeLinks(course.name, course.linksToCourse, mergedCourse.links)

        for (const concept of course.concepts) {
          // TODO merge conflicting descriptions?
          const mergedConcept = mergedCourse.concepts.setDefault(concept.name, {
            description: concept.description,
            course: course.name,
            links: {}
          })

          mergeLinks(concept.name, concept.linksToConcept, mergedConcept.links)
        }
      }
    }

    const workspaceId = hash()
    return await context.prisma.createWorkspace({
      id: workspaceId,
      name,
      sourceProject: { connect: { id: projectId } },
      sourceTemplate: { connect: { id: templateId } },
      participants: {
        create: [{
          privilege: 'OWNER',
          user: { connect: { id: context.user.id } }
        }]
      },
      courses: {
        create: Object.entries(mergedCourses)
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
        create: Object.entries(mergedCourses)
          .flatMap(([toCourse, { links }]) => Object.entries(links)
            .map(([fromCourse, { weight }]) => ({
              createdBy: { connect: { id: context.user.id } },
              from: { connect: { id: hash(fromCourse) } },
              to: { connect: { id: hash(toCourse) } }
            }))
          )
      },
      conceptLinks: {
        create: Object.entries(mergedCourses)
          .flatMap(([toCourse, { concepts }]) => Object.entries(concepts)
            .flatMap(([toConcept, { links }]) => Object.entries(links)
              .map(([fromConcept, { course: fromCourse, weight }]) => ({
                createdBy: { connect: { id: context.user.id } },
                from: { connect: { id: hash(fromCourse, fromConcept) } },
                to: { connect: { id: hash(toCourse, toConcept) } }
              }))
            )
          )
      }
    })
  }
}

module.exports = MergeMutations
