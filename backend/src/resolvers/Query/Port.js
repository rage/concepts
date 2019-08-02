const { checkAccess, Role, Privilege } = require('../../accessControl')

const exportQuery = `
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

const PortQueries = {
  async exportData(root, { workspaceId }, context) {
    await checkAccess(context, {
      minimumRole: Role.GUEST,
      minimumPrivilege: Privilege.READ,
      workspaceId
    })

    const result = await context.prisma.$graphql(exportQuery, {
      id: workspaceId
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
