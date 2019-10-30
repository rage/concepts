import { ForbiddenError } from 'apollo-server-core'

import { checkAccess, Role, Privilege } from '../../util/accessControl'
import { nullShield } from '../../util/errors'
import { createMissingTags, filterTags } from './tagUtils'
import { pubsub } from '../Subscription/config'
import { CONCEPT_CREATED, CONCEPT_UPDATED, CONCEPT_DELETED } from '../Subscription/config/channels'

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
  name, description, official, frozen,
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
    official: Boolean(official),
    frozen: Boolean(frozen),
    course: courseId ? { connect: { id: courseId } } : undefined,
    tags: { connect: await createMissingTags(tags, workspaceId, context, 'conceptTags') }
  })

  if (createdConcept) {
    const pointGroups = await findPointGroups(workspaceId, courseId, context)
    if (pointGroups && pointGroups.length > 0) {
      await updatePointGroups(pointGroups, context)
    }
  }

  const conceptOrder = await context.prisma.course({ id: courseId }).conceptOrder()
  if (!isAutomaticSorting(conceptOrder)) {
    await context.prisma.updateCourse({
      where: { id: courseId },
      data: {
        conceptOrder: { set: conceptOrder.concat([createdConcept.id]) }
      }
    })
  }

  pubsub.publish(CONCEPT_CREATED, { conceptCreated: { ...createdConcept, workspaceId } })
  return createdConcept
}

export const updateConcept = async (root, {
  id, name, description, official, tags, frozen
}, context) => {
  const { id: workspaceId } = nullShield(await context.prisma.concept({ id }).workspace())
  await checkAccess(context, {
    minimumRole: Role.GUEST,
    minimumPrivilege: Privilege.EDIT,
    workspaceId
  })

  const oldConcept = await context.prisma.concept({ id })

  if (oldConcept.frozen && frozen !== false)
    throw new ForbiddenError('This concept is frozen')
  if ((official !== undefined && official !== oldConcept.official)
        || (frozen || oldConcept.frozen)) {
    await checkAccess(context, {
      minimumRole: Role.STAFF,
      workspaceId
    })
  }

  const belongsToTemplate = await context.prisma.workspace({ id: workspaceId }).asTemplate()
  const oldTags = await context.prisma.concept({ id }).tags()

  const data = {
    tags: await filterTags(tags, oldTags, workspaceId, context, 'conceptTags'),
    official: Boolean(official),
    frozen: Boolean(frozen)
  }

  if (description !== undefined) data.description = description
  if (name !== undefined) {
    if (!belongsToTemplate && name !== oldConcept.name) data.official = false
    data.name = name
  }

  const updateData = await context.prisma.updateConcept({
    where: { id },
    data
  })
  pubsub.publish(CONCEPT_UPDATED, { conceptUpdated: { ...updateData, workspaceId } })
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
        frozen
        course {
          id
          conceptOrder
        }
      }
    `)
  if (toDelete.frozen) throw new ForbiddenError('This concept is frozen')
  await context.prisma.deleteConcept({ id })

  const conceptOrder = toDelete.course.conceptOrder
  if (!isAutomaticSorting(conceptOrder)) {
    await context.prisma.updateCourse({
      where: { id: toDelete.course.id },
      data: {
        conceptOrder: { set: conceptOrder.filter(conceptId => conceptId !== id) }
      }
    })
  }
  pubsub.publish(CONCEPT_DELETED, {
    conceptDeleted: { id: toDelete.id, courseId: toDelete.course.id, workspaceId }
  })
  return {
    id: toDelete.id,
    courseId: toDelete.course.id
  }
}
