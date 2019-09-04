const { checkAccess, Role, Privilege } = require('../../accessControl')
const { NotFoundError } = require('../../errors')

const exportQuery = `
query($id : ID!) {
  workspace(where: {
    id: $id
  }) {
    workspaceId: id
    workspace: name
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
        tags {
          name
          type
        }
      }
      tags {
        name
        type
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

    if (!result.workspace) {
      throw new NotFoundError('workspace')
    }

    const prereqMap = ({ from, official }) => ({ name: from.name, official })

    // Create json from workspace
    return JSON.stringify({
      ...result.workspace,
      courses: result.workspace.courses.map(({ concepts, prerequisites, ...course }) => ({
        ...course,
        concepts: concepts.map(({ prerequisites, ...concept }) => ({
          ...concept,
          prerequisites: prerequisites.map(prereqMap)
        })),
        prerequisites: prerequisites.map(prereqMap)
      }))
    })
  }
}

module.exports = PortQueries
