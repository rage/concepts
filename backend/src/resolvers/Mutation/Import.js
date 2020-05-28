import Ajv from 'ajv'

import { checkAccess, Role, Privilege } from '../../util/accessControl'
import schema from '../../static/port.schema'
import makeSecret from '../../util/secret'

const validateData = Ajv().compile(schema)

export const importData = async (root, { data }, context) => {
  await checkAccess(context, { minimumRole: Role.STUDENT })
  let json
  const canSetOfficial = context.role >= Role.STAFF

  try {
    json = JSON.parse(data)
  } catch (err) {
    throw new Error('Error parsing JSON: ' + err.message)
  }
  if (!validateData(json)) {
    for (const error of validateData.errors) {
      console.log(error)
    }
    return null
  }

  // Check if project exists
  if (json.projectId) {
    await checkAccess(context, {
      minimumPrivilege: Privilege.EDIT,
      projectId: json.projectId
    })
    if (json.workspaceId) {
      const templates = await context.prisma.project({
        id: json.projectId
      }).templates()
      if (!templates.find(template => template.id === json.workspaceId)) return null
    }
  }

  const courseTags = new Map(json
    .courses.flatMap(course => course.tags)
    .concat(json.courseTags)
    .map(tag => [tag.name, { ...tag, id: makeSecret(25) }]))

  const conceptTags = new Map(json
    .courses.flatMap(course => course.concepts.flatMap(concept => concept.tags))
    .concat(json.conceptTags)
    .map(tag => [tag.name, { ...tag, id: makeSecret(25) }]))

  // Create or find workspace
  let workspace
  if (json.workspaceId) {
    await checkAccess(context, {
      minimumPrivilege: Privilege.EDIT,
      workspaceId: json.workspaceId
    })
    workspace = await context.prisma.workspace({
      id: json.workspaceId
    })
    if (workspace === null) {
      throw Error('No such workspace')
    }
  } else if (json.workspace) {
    workspace = await context.prisma.createWorkspace({
      name: json.workspace,
      createdBy: { connect: { id: context.user.id } },
      participants: {
        create: [{
          privilege: Privilege.OWNER.toString(),
          user: { connect: { id: context.user.id } }
        }]
      },
      courseTags: { create: Array.from(courseTags.values()) },
      conceptTags: { create: Array.from(conceptTags.values()) },
      goalTags: { create: json.goalTags }
    })
  }

  // Save data to prisma
  const courses = json.courses

  const courseData = await Promise.all(courses.map(async course => {
    const courseObj = await context.prisma.createCourse({
      name: course.name,
      description: course.description,
      official: canSetOfficial && Boolean(json.projectId || course.official),
      createdBy: { connect: { id: context.user.id } },
      conceptOrder: { set: ['__ORDER_BY__CREATION_ASC'] },
      objectiveOrder: { set: ['__ORDER_BY__CREATION_ASC'] },
      workspace: { connect: { id: workspace.id } },
      tags: { connect: course.tags.map(tag => ({ id: courseTags.get(tag.name).id })) }
    })

    const concepts = await Promise.all(course.concepts.map(async concept =>
      context.prisma.createConcept({
        name: concept.name,
        description: concept.description,
        level: concept.level,
        position: concept.position,
        official: canSetOfficial && Boolean(json.projectId || concept.official),
        createdBy: { connect: { id: context.user.id } },
        workspace: { connect: { id: workspace.id } },
        course: { connect: { id: courseObj.id } },
        tags: { connect: concept.tags.map(tag => ({ id: conceptTags.get(tag.name).id })) }
      })
    ))

    return { ...courseObj, concepts }
  }))

  const courseDictionary = {}
  courseData.forEach(course => {
    courseDictionary[course.name] = {
      id: course.id,
      concepts: {}
    }
    course.concepts.forEach(concept => {
      courseDictionary[course.name].concepts[concept.name] = concept.id
    })
  })

  await Promise.all(courses.map(async (course, idx) => {
    // Link course prerequisites
    await Promise.all(course?.prerequisites?.map(async prerequisiteCourse =>
      context.prisma.createCourseLink({
        to: { connect: { id: courseData[idx].id } },
        from: { connect: { id: courseDictionary[prerequisiteCourse.name].id } },
        workspace: { connect: { id: workspace.id } },
        createdBy: { connect: { id: context.user.id } },
        official: canSetOfficial && Boolean(json.projectId || prerequisiteCourse.official)
      })
    ) || [])
    // Link concept prerequisite
    for (const concept of course.concepts) {
      for (const prerequisiteConcept of concept.prerequisites || []) {
        const toConceptId = courseDictionary[course.name].concepts[concept.name]
        let fromConceptIds
        if (prerequisiteConcept.course) {
          fromConceptIds = [courseDictionary[prerequisiteConcept.course]]
            .concepts[prerequisiteConcept.name]
        } else {
          fromConceptIds = Object.values(courseDictionary)
            .filter(course => Object.prototype.hasOwnProperty.call(
              course.concepts, prerequisiteConcept.name))
            .map(course => course.concepts[prerequisiteConcept.name])
        }
        await Promise.all(fromConceptIds.map(fromConceptId =>
          context.prisma.createConceptLink({
            to: { connect: { id: toConceptId } },
            from: { connect: { id: fromConceptId } },
            createdBy: { connect: { id: context.user.id } },
            workspace: { connect: { id: workspace.id } },
            official: canSetOfficial && Boolean(json.projectId || prerequisiteConcept.official),
            text: prerequisiteConcept.text,
            weight: prerequisiteConcept.weight
          })
        ))
      }
    }
  }))

  // Connect workspace as template
  if (json.projectId && json.workspace) {
    await context.prisma.updateWorkspace({
      where: { id: workspace.id },
      data: {
        asTemplate: { connect: { id: json.projectId } }
      }
    })
  }

  return workspace
}
