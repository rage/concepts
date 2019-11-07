import { checkAccess, Role, Privilege } from '../../util/accessControl'
import { NotFoundError } from '../../util/errors'
import { sortedConcepts, sortedCourses } from '../../util/ordering'

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
    courseOrder
    courses {
      name
      official
      conceptOrder
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

export const exportData = async (root, { workspaceId }, context) => {
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
    courses: sortedCourses(result.workspace.courses, result.workspace.courseOrder)
      .map(({ concepts, linksToCourse, ...course }) => ({
        ...course,
        concepts: sortedConcepts(concepts, course.conceptOrder)
          .map(({ linksToConcept, ...concept }) => ({
            ...concept,
            prerequisites: linksToConcept.map(prereqMap)
          })),
        prerequisites: linksToCourse.map(prereqMap)
      }))
  })
}
