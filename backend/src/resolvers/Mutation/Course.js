import { ForbiddenError } from 'apollo-server-core'

import { checkAccess, Role, Privilege } from '../../util/accessControl'
import { nullShield } from '../../util/errors'
import { createMissingTags, filterTags } from './tagUtils'
import { pubsub } from '../Subscription/config'
import { COURSE_CREATED, COURSE_UPDATED, COURSE_DELETED } from '../Subscription/config/channels'

export const createCourse = async (root, { name, workspaceId, official, frozen, tags }, context) => {
  await checkAccess(context, {
    minimumRole: Role.GUEST,
    minimumPrivilege: Privilege.EDIT,
    workspaceId
  })

  if (official || frozen) await checkAccess(context, { minimumRole: Role.STAFF, workspaceId })

  const newCourse = await context.prisma.createCourse({
    name: name,
    official: Boolean(official),
    frozen: Boolean(frozen),
    createdBy: { connect: { id: context.user.id } },
    conceptOrder: { set: ['__ORDER_BY__CREATION_ASC'] },
    workspace: { connect: { id: workspaceId } },
    tags: { connect: await createMissingTags(tags, workspaceId, context, 'courseTags') }
  })

  const courseOrder = await context.prisma.workspace({ id: workspaceId }).courseOrder()
  await context.prisma.updateWorkspace({
    where: { id: workspaceId },
    data: {
      courseOrder: { set: courseOrder.concat([newCourse.id]) }
    }
  })

  pubsub.publish(COURSE_CREATED, { courseCreated: { ...newCourse, workspaceId } })
  return newCourse
}

export const deleteCourse = async (root, { id }, context) => {
  const { id: workspaceId } = nullShield(await context.prisma.course({ id }).workspace())
  await checkAccess(context, {
    minimumRole: Role.GUEST,
    minimumPrivilege: Privilege.EDIT,
    workspaceId
  })
  const toDelete = await context.prisma.course({ id })
  if (toDelete.frozen) throw new ForbiddenError('This course is frozen')
  await context.prisma.deleteManyCourseLinks({
    OR: [
      { from: { id } },
      { to: { id } }
    ]
  })
  const deletedCourse = await context.prisma.deleteCourse({ id })

  const courseOrder = await context.prisma.workspace({ id: workspaceId }).courseOrder()
  await context.prisma.updateWorkspace({
    where: { id: workspaceId },
    data: {
      courseOrder: { set: courseOrder.filter(courseId => courseId !== id) }
    }
  })

  pubsub.publish(COURSE_DELETED, { courseDeleted: { ...deletedCourse, workspaceId } })
  return deletedCourse
}

export const updateCourse = async (root, { id, name, official, frozen, tags, conceptOrder }, context) => {
  const { id: workspaceId } = nullShield(await context.prisma.course({ id }).workspace())
  await checkAccess(context, {
    minimumRole: Role.GUEST,
    minimumPrivilege: Privilege.EDIT,
    workspaceId
  })
  const oldCourse = await context.prisma.course({ id })

  if (oldCourse.frozen && frozen !== false)
    throw new ForbiddenError('This course is frozen')
  if ((official !== undefined && official !== oldCourse.official)
      || (frozen || oldCourse.frozen)) {
    await checkAccess(context, {
      minimumRole: Role.STAFF,
      workspaceId
    })
  }

  const belongsToTemplate = await context.prisma.workspace({ id: workspaceId }).asTemplate()
  const oldTags = await context.prisma.course({ id }).tags()

  const data = {
    tags: await filterTags(tags, oldTags, workspaceId, context, 'courseTags'),
    official: Boolean(official),
    frozen: Boolean(frozen)
  }
  if (conceptOrder !== undefined) {
    data.conceptOrder = {
      set: conceptOrder
    }
  }
  if (name !== undefined) {
    if (!belongsToTemplate && name !== oldCourse.name) data.official = false
    data.name = name
  }
  const updateData = await context.prisma.updateCourse({
    where: { id },
    data
  })
  pubsub.publish(COURSE_UPDATED, { courseUpdated: { ...updateData, workspaceId } })
  return updateData
}
