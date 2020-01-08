import { ForbiddenError } from 'apollo-server-core'

import { checkAccess, Role, Privilege } from '../../util/accessControl'
import { NotFoundError, nullShield } from '../../util/errors'
import { zip } from '../../util/python'
import { createMissingTags, filterTags } from './tagUtils'
import pubsub from '../Subscription/pubsub'
import {
  CONCEPT_CREATED,
  CONCEPT_UPDATED,
  CONCEPT_DELETED,
  MANY_CONCEPTS_DELETED,
  MANY_CONCEPTS_UPDATED
} from '../Subscription/channels'

const findPointGroups = async (workspaceId, courseId, context) => {
  if (context.role === Role.STUDENT) {
    const sourceCourseId = (await context.prisma.course({ id: courseId }).sourceCourse() || {}).id
    if (!sourceCourseId) {
      return null
    }
    const pgData = await context.prisma.$graphql(`
      query($workspaceId: ID!, $userId: ID!, $courseId: ID!) {
        workspace(where: { id: $workspaceId }) {
          sourceTemplate {
            mainCourse {
              id
            }
            pointGroups(where: { course: { id: $courseId } }) {
              id
              name
              startDate
              endDate
              maxPoints
              pointsPerConcept
              course {
                id
              }
              completions(where: { user: { id: $userId } }) {
                id
                conceptAmount
              }
            }
          }
        }
      }
    `, { workspaceId, userId: context.user.id, courseId: sourceCourseId })
    const sourceTemplate = pgData?.workspace?.sourceTemplate
    if (!sourceTemplate?.pointGroups || !sourceTemplate?.mainCourse) {
      return null
    }
    const mainCourseId = sourceTemplate.mainCourse.id
    if (sourceCourseId !== mainCourseId) {
      return null
    }
    const currentTime = new Date().getTime()
    return sourceTemplate.pointGroups.filter(
      group => group.course.id === mainCourseId
        && new Date(group.startDate).getTime() <= currentTime
        && new Date(group.endDate).getTime() >= currentTime)
  }
}

const updatePointGroups = async (pointGroups, context) => {
  for (const group of pointGroups) {
    if (group.completions.length > 0) {
      const completion = group.completions[0]
      await context.prisma.updateCompletion({
        where: { id: completion.id },
        data: {
          conceptAmount: completion.conceptAmount + 1
        }
      })
    } else {
      await context.prisma.createCompletion({
        conceptAmount: 1,
        user: { connect: { id: context.user.id } },
        pointGroup: { connect: { id: group.id } }
      })
    }
  }
}

const isAutomaticSorting = conceptOrder => conceptOrder.length === 1
  && conceptOrder[0].startsWith('__ORDER_BY__')

export const createConcept = async (root, {
  name, description, level, position, official, frozen,
  courseId, workspaceId, tags
}, context) => {
  await checkAccess(context, {
    minimumRole: Role.GUEST,
    minimumPrivilege: Privilege.EDIT,
    workspaceId
  })

  if (official || frozen) await checkAccess(context, { minimumRole: Role.STAFF, workspaceId })
  const createdConcept = await context.prisma.createConcept({
    name,
    createdBy: { connect: { id: context.user.id } },
    workspace: { connect: { id: workspaceId } },
    description,
    level,
    position,
    official: Boolean(official),
    frozen: Boolean(frozen),
    course: { connect: { id: courseId } },
    tags: tags && { connect: await createMissingTags(tags, workspaceId, context, 'conceptTags') }
  })

  if (level === 'COMMON') {
    await context.prisma.updateWorkspace({
      where: { id: workspaceId },
      data: {
        commonConcepts: { connect: { id: createdConcept.id } }
      }
    })
  } else {
    if (createdConcept) {
      const pointGroups = await findPointGroups(workspaceId, courseId, context)
      if (pointGroups && pointGroups.length > 0) {
        await updatePointGroups(pointGroups, context)
      }
    }

    const orderName = `${level.toLowerCase()}Order`
    const conceptOrder = await context.prisma.course({ id: courseId })[orderName]()
    if (!isAutomaticSorting(conceptOrder)) {
      await context.prisma.updateCourse({
        where: { id: courseId },
        data: {
          [orderName]: { set: conceptOrder.concat([createdConcept.id]) }
        }
      })
    }
  }

  pubsub.publish(CONCEPT_CREATED, { conceptCreated: { ...createdConcept, workspaceId } })
  return createdConcept
}

export const createConceptFromCommon = async (root, { conceptId, courseId }, context, ...rest) => {
  const { id: workspaceId } = nullShield(
    await context.prisma.concept({ id: conceptId }).workspace())
  const concept = nullShield(await context.prisma.concept({ id: conceptId }))
  if (concept.level === 'COMMON') {
    return createConcept(root, {
      name: concept.name,
      level: 'OBJECTIVE',
      courseId,
      workspaceId
    }, context, ...rest)
  } else {
    throw new ForbiddenError(`The concept "${concept.name}" is not a common concept`)
  }
}

const sharedUpdateConcept = async ({
  id, name, description, level, position, official, tags, frozen
}, oldConcept, workspaceId, belongsToTemplate, levelChange, context) => {
  if (oldConcept.frozen && frozen !== false) {
    throw new ForbiddenError(`The concept "${oldConcept.name}" is frozen`)
  }
  if ((official !== undefined && official !== oldConcept.official)
    || (frozen || oldConcept.frozen)) {
    if (context.user.role < Role.STAFF) {
      throw new ForbiddenError('Access denied')
    }
  }

  const oldTags = await context.prisma.concept({ id }).tags()

  const data = {
    tags: await filterTags(tags, oldTags, workspaceId, context, 'conceptTags'),
    official: Boolean(official),
    frozen: Boolean(frozen)
  }

  if (level !== undefined && level !== oldConcept.level) {
    if (oldConcept.level === 'COMMON') {
      // TODO Maybe allow for changing the level?
      throw new ForbiddenError('Cannot change the level of a common concept.')
    }
    data.level = level
    await levelChange(level)
  }

  if (description !== undefined) data.description = description
  if (position !== undefined) data.position = position
  if (name !== undefined) {
    if (!belongsToTemplate && name !== oldConcept.name) data.official = false
    data.name = name
  }

  return data
}

export const updateConcept = async (root, concept, context) => {
  const id = concept.id

  const { id: workspaceId } = nullShield(await context.prisma.concept({ id }).workspace())
  await checkAccess(context, {
    minimumRole: Role.GUEST,
    minimumPrivilege: Privilege.EDIT,
    workspaceId
  })

  const oldConcept = await context.prisma.concept({ id })
  const belongsToTemplate = await context.prisma.workspace({ id: workspaceId }).asTemplate()

  const levelChange = async level => {
    const oldOrderName = `${oldConcept.level.toLowerCase()}Order`
    const newOrderName = `${level.toLowerCase()}Order`
    const courseId = await context.prisma.concept({ id }).course().id()
    const oldOrder = await context.prisma.course({ id: courseId })[oldOrderName]()
    const newOrder = await context.prisma.course({ id: courseId })[newOrderName]()
    await context.prisma.updateCourse({
      where: { id: courseId },
      data: {
        [oldOrderName]: { set: oldOrder.filter(concept => concept.id !== id) },
        [newOrderName]: { set: !isAutomaticSorting(newOrder) ? newOrder.concat([id]) : newOrder }
      }
    })
  }

  const updateArgs = await sharedUpdateConcept(concept, oldConcept,
    workspaceId, belongsToTemplate, levelChange, context)
  const updateData = await context.prisma.updateConcept({
    where: { id },
    data: updateArgs
  })

  pubsub.publish(CONCEPT_UPDATED, { conceptUpdated: { ...updateData, workspaceId } })
  return updateData
}

export const deleteManyConcepts = async(root, { ids }, context) => {
  const { id: workspaceId } = nullShield(await context.prisma.concept({ id: ids[0] }).workspace())
  await checkAccess(context, {
    minimumRole: Role.GUEST,
    minimumPrivilege: Privilege.EDIT,
    workspaceId
  })

  const idSet = new Set(ids)
  const course = await context.prisma.concept({ id: ids[0] }).course()
  await context.prisma.updateCourse({
    where: { id: course.id },
    data: {
      conceptOrder: { set: course.conceptOrder.filter(conceptId => !idSet.has(conceptId)) },
      objectiveOrder: { set: course.objectiveOrder.filter(conceptId => !idSet.has(conceptId)) }
    }
  })

  await context.prisma.deleteManyConcepts({
    // eslint-disable-next-line camelcase
    id_in: ids,
    workspace: { id: workspaceId },
    course: { id: course.id }
  })

  pubsub.publish(MANY_CONCEPTS_DELETED, {
    manyConceptsDeleted: { ids, courseId: course.id, workspaceId }
  })

  return {
    courseId: course.id,
    ids
  }
}

export const updateManyConcepts = async(root, { concepts }, context) => {
  const { id: workspaceId } = nullShield(
    await context.prisma.concept({ id: concepts[0].id }).workspace())
  const { id: courseId } = nullShield(await context.prisma.concept({ id: concepts[0].id }).course())

  await checkAccess(context, {
    minimumRole: Role.GUEST,
    minimumPrivilege: Privilege.EDIT,
    workspaceId
  })

  const belongsToTemplate = await context.prisma.workspace({ id: workspaceId }).asTemplate()

  const oldConcepts = await context.prisma.concepts({
    where: {
      // eslint-disable-next-line camelcase
      id_in: concepts.map(concept => concept.id)
    }
  })
  if (oldConcepts.length !== concepts.length) {
    throw new NotFoundError('concept')
  }
  concepts.sort((a, b) => a.id > b.id)
  oldConcepts.sort((a, b) => a.id > b.id)

  const toObjective = new Set()
  const toConcept = new Set()
  const updateData = await Promise.all(zip(concepts, oldConcepts).map(async args => {
    const [concept, oldConcept] = args
    const levelChange = level => {
      if (level === 'CONCEPT') toConcept.add(concept.id)
      else toObjective.add(concept.id)
    }
    const data = await sharedUpdateConcept(concept, oldConcept,
      workspaceId, belongsToTemplate, levelChange, context)
    return await context.prisma.updateConcept({
      where: {
        id: concept.id
        // TODO verify these too
        // workspace: { id: workspaceId },
        // course: { id: courseId }
      },
      data
    })
  }))

  if (toObjective.size > 0 || toConcept.size > 0) {
    const conceptOrder = await context.prisma.course({ id: courseId }).conceptOrder()
    const objOrder = await context.prisma.course({ id: courseId }).objectiveOrder()
    await context.prisma.updateCourse({
      where: { id: courseId },
      data: {
        conceptOrder: { set: conceptOrder.filter(id => !toObjective.has(id)).push(...toConcept) },
        objectiveOrder: { set: objOrder.filter(id => !toConcept.has(id)).push(...toObjective) }
      }
    })
  }

  updateData.workspaceId = workspaceId

  pubsub.publish(MANY_CONCEPTS_UPDATED, {
    manyConceptsUpdated: updateData
  })

  return updateData
}

export const deleteConcept = async (root, { id }, context) => {
  const { id: workspaceId } = nullShield(await context.prisma.concept({ id }).workspace())
  await checkAccess(context, {
    minimumRole: Role.GUEST,
    minimumPrivilege: Privilege.EDIT,
    workspaceId
  })
  const toDelete = await context.prisma.concept({ id }).$fragment(`
      fragment ConceptWithCourse on Concept {
        id
        level
        frozen
        course {
          id
          conceptOrder
          objectiveOrder
        }
      }
    `)
  if (toDelete.frozen) throw new ForbiddenError('This concept is frozen')
  await context.prisma.deleteConcept({ id })

  if (toDelete.level !== 'COMMON') {
    const orderName = `${toDelete.level.toLowerCase()}Order`
    const conceptOrder = toDelete.course[orderName]
    if (!isAutomaticSorting(conceptOrder)) {
      await context.prisma.updateCourse({
        where: { id: toDelete.course.id },
        data: {
          [orderName]: { set: conceptOrder.filter(conceptId => conceptId !== id) }
        }
      })
    }
  }
  pubsub.publish(CONCEPT_DELETED, {
    conceptDeleted: { id: toDelete.id, courseId: toDelete.course.id, workspaceId }
  })
  return {
    id: toDelete.id,
    courseId: toDelete.course.id
  }
}
