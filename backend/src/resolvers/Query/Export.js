const { checkAccess, Role, Privilege } = require('../../util/accessControl')
const { NotFoundError } = require('../../util/errors')

const exportQuery = `
query($id: ID!) {
  workspace(where: { id: $id }) {
    workspaceId: id
    workspace: name
    courseTags {
      name
      type
      priority
    }
    conceptTags {
      name
      type
      priority
    }
    courses {
      name
      official
      concepts {
        name
        description
        official
        linksToConcept {
          official
          from {
            name
          }
        }
        tags {
          name
          type
          priority
        }
      }
      tags {
        name
        type
        priority
      }
      linksToCourse {
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
      courses: result.workspace.courses.map(({ concepts, linksToCourse, ...course }) => ({
        ...course,
        concepts: concepts.map(({ linksToConcept, ...concept }) => ({
          ...concept,
          prerequisites: linksToConcept.map(prereqMap)
        })),
        prerequisites: linksToCourse.map(prereqMap)
      }))
    })
  }
}

module.exports = PortQueries
