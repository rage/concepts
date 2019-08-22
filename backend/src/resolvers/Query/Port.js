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
      official
      concepts {
        name
        description
        official
        prerequisites: linksToConcept {
          official
          from {
            name
          }
        }
      }
      prerequisites: linksToCourse {
        official
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
        'official': course['official'],
        'concepts': [],
        'prerequisites': []
      }
      for (const prerequisiteCourse of course['prerequisites']) {
        courseData['prerequisites'].push({
          'name': prerequisiteCourse['from']['name'],
          'official': prerequisiteCourse['official']
        })
      }
      for (const concept of course['concepts']) {
        const conceptData = {
          'name': concept['name'],
          'official': concept['official'],
          'description': concept['description'],
          'prerequisites': []
        }
        for (const prerequisiteConcept of concept['prerequisites']) {
          // Add concept prerequisite to concept
          conceptData['prerequisites'].push({
            'name': prerequisiteConcept['from']['name'],
            'official': prerequisiteConcept['official']
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
