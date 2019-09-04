const { checkAccess, Role, Privilege } = require('../../accessControl')
const { NotFoundError } = require('../../errors')

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
        tags {
          id
          name
          type
          priority
        }
      }
      tags {
        id
        name
        type
        priority
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

    // Create json from workspace
    return JSON.stringify({
      workspaceId: result.workspace.id,
      workspace: result.workspace.name,
      courses: result.workspace.courses.map(course => ({
        name: course.name,
        official: course.official,
        concepts: course.concepts.map(concept => ({
          name: concept.name,
          official: concept.official,
          description: concept.description,
          prerequisites: concept.prerequisites.map(prereq => ({
            name: prereq.from.name,
            official: prereq.official
          })),
          tags: concept.tags.map(tag => ({
            name: tag.name,
            type: tag.type
          }))
        })),
        prerequisites: course.prerequisites.map(prereq => ({
          name: prereq.from.name,
          official: prereq.official
        })),
        tags: course.tags.map(tag => ({
          name: tag.name,
          type: tag.type
        }))
      }))
    })
  }
}

module.exports = PortQueries
