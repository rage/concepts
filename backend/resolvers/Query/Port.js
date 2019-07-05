const { checkAccess } = require('../../accessControl')

const PortQueries = {
  async exportData(root, args, context) {
    checkAccess(context, { allowStaff: true, allowStudent: true })
    const query = `
    query($id : ID!) {
      workspace(where: {
        id: $id
      }) {
        id
        name
        courses {
          name
          concepts {
            name
            description
            prerequisites: linksFromConcept {
              to {
                name
                official
              }
            }
          }
          prerequisites: linksFromCourse {
            to {
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
      throw new Error("Workspace not found")
    }

    // Create json from workspace
    const jsonData = {
      'workspaceId': workspace.id,
      'workspace': workspace.name,
      'courses': []
    }
    
    for (const course of workspace['courses']) {
      const courseData = {
        'name': course['name'],
        'concepts': [],
        'prerequisites': []
      }
      for (const prerequisiteCourse of course['prerequisites']) {
        courseData['prerequisites'].push(prerequisiteCourse['to']['name'])
      }
      for (const concept of course['concepts']) {
        const conceptData = {
          'name': concept['name'],
          'description': concept['description'],
          'prerequisites': []
        }
        for (const prerequisiteConcept of concept['prerequisites'] ) {
          // Add concept prerequisite to concept
          conceptData['prerequisites'].push({
            'name': prerequisiteConcept['to']['name']
          })
        }
        // Add concept to course
        courseData['prerequisites'].push(conceptData)
      }

      // Add course prerequisites
      jsonData['courses'].push(courseData)
    }


    return JSON.stringify(jsonData)
  }
}

module.exports = PortQueries