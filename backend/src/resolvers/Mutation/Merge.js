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
          linksFromCourse {
            to {
              name
            }
          }
          concepts {
            id
            name
            description
            linksFromConcept {
              id
              to {
                name
              }
            }
          }
        }
      }
    }
  }
}
`

const sha1digest = (...vars) => {
  const sha1 = crypto.createHash('sha1')
  for (const item of vars) {
    sha1.update(item)
  }
  return sha1.digest('base64')
}

const MergeMutations = {
  async mergeWorkspaces(root, { projectId }, context) {
    const seed = makeSecret(32)
    const hash = (...vars) => sha1digest(seed, ...vars).substr(0, 25)

    // Check if project has an active template
    const activeTemplate = context.prisma.project({
      id: projectId
    }).activeTemplate()

    if (!activeTemplate) {
      throw new Error('No active template found.')
    }

    // Merge
    const result = await context.prisma.$graphql(clonedWorkspacesQuery, {
      id: projectId
    })

    // TODO simplify everything after this point

    const activeTemplateId = result.project.activeTemplate.id
    const activeTemplateName = result.project.activeTemplate.name
    const clonedWorkspaces = result.project.activeTemplate.clones

    const mergedWorkspaceData = {
      name: activeTemplateName + ' merge',
      courses: {}, // Merged courses, value is a list of concepts related to the course
      concepts: {}, // Merged concepts, to filter out duplicates
      courseLinks: {}, // Key: fromCourseId + toCourseId, Strength of connection
      conceptLinks: {} // Key: fromConceptId + toConceptId, Strength of connection
    }

    // Preprocess data
    for (const workspace of clonedWorkspaces) {
      for (const course of workspace.courses) {
        if (!(course.name in mergedWorkspaceData.courses)) {
          mergedWorkspaceData.courses[course.name] = []
        }
        // Add links to courses
        mergedWorkspaceData.courseLinks[course.name] = {}
        course.linksFromCourse.forEach(courseLink => {
          if (!mergedWorkspaceData.courseLinks[course.name][courseLink.to.name]) {
            mergedWorkspaceData.courseLinks[course.name][courseLink.to.name] = 1
          } else {
            mergedWorkspaceData.courseLinks[course.name][courseLink.to.name]++
          }
        })

        // Add concepts
        for (const concept of course.concepts) {
          if (!(concept.name in mergedWorkspaceData.concepts)) {
            mergedWorkspaceData.concepts[concept.name] = course.name
            mergedWorkspaceData.courses[course.name].push({
              name: concept.name,
              description: concept.description
            })
          }

          mergedWorkspaceData.conceptLinks[concept.name] = {}
          concept.linksFromConcept.forEach(conceptLink => {
            if (!mergedWorkspaceData.conceptLinks[concept.name][conceptLink.to.name]) {
              mergedWorkspaceData.conceptLinks[concept.name][conceptLink.to.name] = 1
            } else {
              mergedWorkspaceData.conceptLinks[concept.name][conceptLink.to.name]++
            }
          })
        }
      }
    }

    const workspaceId = hash()
    return await context.prisma.createWorkspace({
      id: workspaceId,
      name: mergedWorkspaceData.name,
      sourceProject: {
        connect: {
          id: projectId
        }
      },
      sourceTemplate: {
        connect: {
          id: activeTemplateId
        }
      },
      participants: {
        create: [{
          privilege: 'OWNER',
          user: { connect: { id: context.user.id } }
        }]
      },
      courses: {
        create: Object.keys(mergedWorkspaceData.courses).map(courseName => ({
          id: hash(courseName),
          name: courseName,
          createdBy: { connect: { id: context.user.id } },
          concepts: {
            create: mergedWorkspaceData.courses[courseName].map(concept => ({
              id: hash(courseName, concept.name),
              name: concept.name,
              description: concept.description,
              createdBy: { connect: { id: context.user.id } },
              workspace: { connect: { id: workspaceId } }
            }))
          }
        }))
      },
      courseLinks: {
        create: Object.keys(mergedWorkspaceData.courseLinks).map(fromCourse => Object.keys(mergedWorkspaceData.courseLinks[fromCourse]).map(toCourse => ({
          createdBy: { id: context.user.id },
          from: hash(fromCourse),
          to: hash(toCourse)
          // weight: mergedWorkspace.courseLinks[fromCourse][toCourse]
        }))).reduce((a, b) => a.concat(b), [])
      },
      conceptLinks: {
        create: Object.keys(mergedWorkspaceData.conceptLinks).map(fromConcept => Object.keys(mergedWorkspaceData.conceptLinks[fromConcept]).map(toConcept => ({
          createdBy: { id: context.user.id },
          from: hash(mergedWorkspaceData.concepts[fromConcept], fromConcept),
          to: hash(mergedWorkspaceData.concepts[toConcept], toConcept)
          // weight: mergedWorkspaceData.conceptLinks[fromConcept][toConcept]
        }))).reduce((a, b) => a.concat(b), [])
      }
    })
  }
}

module.exports = MergeMutations
