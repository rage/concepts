import { verifyAndRespondRequest } from '../util/restAuth'
import { prisma } from '../../schema/generated/prisma-client'
import { checkAccess, Role, Privilege } from '../util/accessControl'
import { sortedConcepts, sortedCourses } from '../util/ordering'

const exportQuery = `
query($wid: ID!) {
  workspace(where: { id: $wid }) {
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

}

export const exportAPI = async (req, res) => {
  const resp = verifyAndRespondRequest(req, res, 'EXPORT_WORKSPACE')
  if (resp !== 'OK') return resp
  const { wid } = req.params

  const result = await prisma.$graphql(exportQuery, { wid })

  if (!result.workspace) {
    return res.status(404).json({ error: 'Workspace not found' })
  }

  const prereqMap = ({ from, official }) => ({ name: from.name, official })

  res.set('Content-Disposition', `attachment; filename="${result.workspace.workspace}.json"`)
  return res.json({
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
