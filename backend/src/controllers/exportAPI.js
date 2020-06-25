import { verifyAndRespondRequest } from '../util/restAuth'
import { prisma } from '../../schema/generated/prisma-client'
import { sortedItems, sortedCourses } from '../util/ordering'

const exportQuery = `
query($wid: ID!) {
  workspace(where: { id: $wid }) {
    workspaceId: id
    workspace: name
    commonConcepts {
      name
      description
      level
      official
      tags {
        name
        type
        priority
      }
    }
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
      description
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

/**
 * Convert response to markdown format
 * @param {workspace} workspace Workspace from the query
 */
const workspaceToMarkdown = (workspace) => {
  let markdown = [`# ${workspace.workspace}`]
  for (const course of workspace.courses) {
    markdown.push("\n## " + course.name)
    markdown.push("### Objectives")
    for (const concept of course.concepts) {
      if (concept.level == 'OBJECTIVE') {
        markdown.push("- " + concept.name)
        markdown.push("\t- " + concept.description)
      }
    }
    
    const prereqs = course.linksToCourse.filter(link => link.from.name != course.name)
    if (prereqs.length > 0) {
      markdown.push("### Prerequisites")
      for (const courseLink of prereqs) {
        markdown.push("- " + courseLink.from.name)
      }
    }
  }

  return markdown.join("\n")
}

export const markdownExportAPI = async (req, res) => {
  const resp = verifyAndRespondRequest(req, res, 'EXPORT_MARKDOWN')

  if (resp !== 'OK') return resp
  const { wid } = req.params

  const result = await prisma.$graphql(exportQuery, { wid })
  const markdown = workspaceToMarkdown(result.workspace)

  res.set('Content-Disposition', `attachment; filename="${result.workspace.workspace}.md"`)
  return res.send(markdown)
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

  const courseOrder = result.workspace.courseOrder
  delete result.workspace.courseOrder

  const isLevel = level => concept => concept.level === level

  res.set('Content-Disposition', `attachment; filename="${result.workspace.workspace}.json"`)
  return res.json({
    ...result.workspace,
    courses: sortedCourses(result.workspace.courses, courseOrder)
      .map(({ concepts, linksToCourse, conceptOrder, objectiveOrder, ...course }) => ({
        ...course,
        concepts: sortedItems(concepts.filter(isLevel('CONCEPT')), conceptOrder)
          .concat(sortedItems(concepts.filter(isLevel('OBJECTIVE')), objectiveOrder))
          .map(({ linksToConcept, ...concept }) => ({
            ...concept,
            prerequisites: linksToConcept.map(prereqMap)
          })),
        prerequisites: linksToCourse.map(prereqMap)
      }))
  })
}
