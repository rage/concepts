const { checkAccess, Role, Privilege } = require('../../accessControl')

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
            to {
              name
            }
          }
          concepts {
            id
            name
            description
            linksToConcept {
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

const secretCharset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const makeSecret = length => Array.from({ length },
  () => secretCharset[Math.floor(Math.random() * secretCharset.length)]).join('')


const MergeMutations = {
  async mergeWorkspaces(root, { projectId }, context) {
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
    
    const activeTemplateId = result.project.activeTemplate.id
    const activeTemplateName = result.project.activeTemplate.name
    const clonedWorkspaces = result.project.activeTemplate.clones
    
    const mergedWorkspaceData = {
      name: activeTemplateName + " merge",
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
        for (const concept of course.concepts) {
          if (!(concept.name in mergedWorkspaceData.concepts)) {
            mergedWorkspaceData.concepts[concept.name] = true
            mergedWorkspaceData.courses[course.name].push({
              name: concept.name,
              description: concept.description
            })
          }
        }
      }
    }

    const workspaceId = makeSecret(25)
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
          name: courseName,
          createdBy: { connect: { id: context.user.id }},
          concepts: {
            create: mergedWorkspaceData.courses[courseName].map(concept => ({
              name: concept.name,
              description: concept.description,
              createdBy: { connect: { id: context.user.id } },
              workspace: { connect: { id: workspaceId } }
            }))
          }
        }))
      }
    });
  }
}

module.exports = MergeMutations