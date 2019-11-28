import { ForbiddenError } from 'apollo-server-core'

import { checkAccess, Role, Privilege } from '../../util/accessControl'
import { nullShield } from '../../util/errors'
import { createMissingTags, filterTags } from './tagUtils'
import { pubsub } from '../Subscription/config'
import {
  OBJECTIVE_CREATED,
  OBJECTIVE_UPDATED,
  OBJECTIVE_DELETED
} from '../Subscription/config/channels'

export const createObjective = async (root, {
  name, description, official, frozen,
  courseId, workspaceId, tags
}, context) => {
  await checkAccess(context, {
    minimumRole: Role.GUEST,
    minimumPrivilege: Privilege.EDIT,
    workspaceId
  })
  if (official || frozen) await checkAccess(context, { minimumRole: Role.STAFF, workspaceId })
  const createdObjective = await context.prisma.createObjective({
    name,
    createdBy: { connect: { id: context.user.id } },
    workspace: { connect: { id: workspaceId } },
    description,
    official: Boolean(official),
    frozen: Boolean(frozen),
    course: { connect: { id: courseId } },
    tags: {
      connect: await createMissingTags(tags, workspaceId, context, 'objectiveTags')
    }
  })

  pubsub.publish(OBJECTIVE_CREATED, { objectiveCreated: { ...createdObjective, workspaceId } })
  return createdObjective
}

export const updateObjective = async (root, {
  id, name, description, official, tags, frozen
}, context) => {
  const { id: workspaceId } = nullShield(await context.prisma.concept({ id }).workspace())
  await checkAccess(context, {
    minimumRole: Role.GUEST,
    minimumPrivilege: Privilege.EDIT,
    workspaceId
  })

  const oldObjective = await context.prisma.objective({ id })

  if (oldObjective.frozen && frozen !== false)
    throw new ForbiddenError('This objective is frozen')
  if ((official !== undefined && official !== oldObjective.official)
    || (frozen || oldObjective.frozen)) {
    await checkAccess(context, {
      minimumRole: Role.STAFF,
      workspaceId
    })
  }

  const belongsToTemplate = await context.prisma.workspace({ id: workspaceId }).asTemplate()
  const oldTags = await context.prisma.concept({ id }).tags()

  const data = {
    tags: await filterTags(tags, oldTags, workspaceId, context, 'objectiveTags'),
    official: Boolean(official),
    frozen: Boolean(frozen)
  }

  if (description !== undefined) data.description = description
  if (name !== undefined) {
    if (!belongsToTemplate && name !== oldObjective.name) data.official = false
    data.name = name
  }

  const updatedObjective = await context.prisma.updateObjective({
    where: { id },
    data
  })

  pubsub.publish(OBJECTIVE_UPDATED, { conceptUpdated: { ...updatedObjective, workspaceId } })
  return updatedObjective
}

export const deleteObjective = async (root, { id }, context) => {
  const { id: workspaceId } = nullShield(await context.prisma.concept({ id }).workspace())
  await checkAccess(context, {
    minimumRole: Role.GUEST,
    minimumPrivilege: Privilege.EDIT,
    workspaceId
  })
  const toDelete = await context.prisma.objective({ id }).$fragment(`
      fragment ObjectiveWithCourse on Objective {
        id
        frozen
        course {
          id
        }
      }
    `)
  if (toDelete.frozen) throw new ForbiddenError('This objective is frozen')
  await context.prisma.deleteObjective({ id })

  pubsub.publish(OBJECTIVE_DELETED, {
    objectiveDeleted: { id: toDelete.id, courseId: toDelete.course.id, workspaceId }
  })
  return {
    id: toDelete.id,
    courseId: toDelete.course.id
  }
}
