const { checkAccess } = require('../../accessControl')

const PortQueries = {
  async exportData(root, args, context) {
    checkAccess(context, { allowGuest: true, allowStaff: true, allowStudent: true })
    const query = `
    query($id : ID!) {
      workspace(where: {
        id: $id
      }) {
        id
        name
        defaultCourse {
          name
        }
        courses {
          name
          concepts {
            name
            description
            prerequisites: linksToConcept {
              from {
                name
                official
              }
            }
          }
          prerequisites: linksToCourse {
            from {
              name
            }
          }
        }
      }
    }
    `

    const result = await context.prisma.$graphql(query, {
      id: args.workspaceId
    })

    const workspace = result['workspace']

    if (!workspace) {
      throw new Error('Workspace not found')
    }

    // Create json from workspace
    const jsonData = {
      'workspaceId': workspace.id,
      'workspace': workspace.name,
      'courses': []
    }

    if (workspace.defaultCourse) {
      jsonData['defaultCourse'] = workspace.defaultCourse.name
    }


    for (const course of workspace['courses']) {
      const courseData = {
        'name': course['name'],
        'concepts': [],
        'prerequisites': []
      }
      for (const prerequisiteCourse of course['prerequisites']) {
        courseData['prerequisites'].push(prerequisiteCourse['from']['name'])
      }
      for (const concept of course['concepts']) {
        const conceptData = {
          'name': concept['name'],
          'description': concept['description'],
          'prerequisites': []
        }
        for (const prerequisiteConcept of concept['prerequisites']) {
          // Add concept prerequisite to concept
          conceptData['prerequisites'].push({
            'name': prerequisiteConcept['from']['name']
          })
        }
        // Add concept to course
        courseData['concepts'].push(conceptData)
      }

      // Add course prerequisites
      jsonData['courses'].push(courseData)
    }

    return JSON.stringify(jsonData)
  }
}

module.exports = PortQueries
