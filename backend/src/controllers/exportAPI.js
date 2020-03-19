import { verifyAndRespondRequest } from '../util/restAuth'
import { prisma } from '../../schema/generated/prisma-client'
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
    goalTags {
      name
      type
      priority
    }
    courseOrder
    courses {
      name
      official
      conceptOrder
      objectiveOrder
      concepts {
        name
        description
        position
        level
        official
        linksToConcept {
          official
          text
          weight
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

export const exportAPI = async (req, res) => {
  const resp = verifyAndRespondRequest(req, res, 'EXPORT_WORKSPACE')
  if (resp !== 'OK') return resp
  const { wid } = req.params

  const result = await prisma.$graphql(exportQuery, { wid })

  if (!result.workspace) {
    return res.status(404).json({ error: 'Workspace not found' })
  }

  const prereqMap = ({ from, official }) => ({ name: from.name, official })

  const courseOrder = result.workspace.courseOrder
  delete result.workspace.courseOrder

  const isLevel = level => concept => concept.level === level

  res.set('Content-Disposition', `attachment; filename="${result.workspace.workspace}.json"`)
  return res.json({
    ...result.workspace,
    courses: sortedCourses(result.workspace.courses, courseOrder)
      .map(({ concepts, linksToCourse, conceptOrder, objectiveOrder, ...course }) => ({
        ...course,
        concepts: sortedConcepts(concepts.filter(isLevel('CONCEPT')), conceptOrder)
          .concat(sortedConcepts(concepts.filter(isLevel('OBJECTIVE')), objectiveOrder))
          .map(({ linksToConcept, ...concept }) => ({
            ...concept,
            prerequisites: linksToConcept.map(prereqMap)
          })),
        prerequisites: linksToCourse.map(prereqMap)
      }))
  })
}
