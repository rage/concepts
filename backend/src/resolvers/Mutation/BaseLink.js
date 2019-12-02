import { ForbiddenError } from 'apollo-server-core'

import { checkAccess, Role, Privilege } from '../../util/accessControl'
import { nullShield } from '../../util/errors'
import pubsub from '../Subscription/pubsub'
import * as channels from '../Subscription/channels'

const getParams = (action, type) => ({
  name: type,
  getMethod: `${type.toCamelCase()}Link`,
  mutateMethod: `${action}${type.toPascalCase()}Link`,
  pubsubVariableName: `${type.toCamelCase()}${action.toPascalCase()}`,
  // eslint-disable-next-line import/namespace
  channel: channels[`${type.toUpperSnakeCase()}_LINK_${action.toUpperCase()}D`]
})

const generic = (action, fn) => type => {
  const params = getParams(action, type)
  return (root, args, context) => {
    context.type = params
    return fn(root, args, context)
  }
}

export const createLink = generic('create', async (root, { workspaceId, official, from, to }, context) => {
  await checkAccess(context, {
    minimumRole: official ? Role.STAFF : Role.GUEST,
    minimumPrivilege: Privilege.EDIT,
    workspaceId
  })

  const linkExists = await context.prisma.$exists[context.type.getMethod]({
    AND: [
      { workspace: { id: workspaceId } },
      { to: { id: to } },
      { from: { id: from } }
    ]
  })
  if (linkExists) return null
  const createdLink = await context.prisma[context.type.mutateMethod]({
    to: { connect: { id: to } },
    from: { connect: { id: from } },
    official: Boolean(official),
    createdBy: { connect: { id: context.user.id } },
    workspace: { connect: { id: workspaceId } }
  })
  pubsub.publish(context.type.channel, {
    [context.type.pubsubVariableName]: { ...createdLink, workspaceId }
  })
  return createdLink
})

export const updateLink = generic('update', async (root, { id, frozen, official }, context) => {
  const { id: workspaceId } = nullShield(
    await context.prisma[context.type.getMethod]({ id }).workspace())
  await checkAccess(context, {
    minimumRole: Role.STAFF,
    minimumPrivilege: Privilege.EDIT,
    workspaceId
  })
  const oldLink = await context.prisma[context.type.getMethod]({ id })
  if (oldLink.frozen && frozen !== false) throw new ForbiddenError('This link is frozen')

  const updatedLink = await context.prisma[context.type.mutateMethod]({
    where: { id },
    data: { frozen, official }
  })
  pubsub.publish(context.type.channel, {
    [context.type.pubsubVariableName]: { ...updatedLink, workspaceId }
  })
  return updatedLink
})

const getMetadata = async (id, context) => {
  const data = { id }
  let toCourseGetter = context.prisma[context.type.getMethod]({ id }).to()
  if (context.type.name !== 'course') {
    toCourseGetter = toCourseGetter.course()
  }
  data.courseId = (await toCourseGetter).id

  if (context.type.name === 'concept') {
    const toData = await context.prisma[context.type.getMethod]({ id }).to()
    data[`${context.type.name}Id`] = toData.id
  }
  return data
}

export const deleteLink = generic('delete', async (root, { id }, context) => {
  const { id: workspaceId } = nullShield(
    await context.prisma[context.type.getMethod]({ id }).workspace())
  await checkAccess(context, {
    minimumRole: Role.GUEST,
    minimumPrivilege: Privilege.EDIT,
    workspaceId
  })
  const frozen = await context.prisma[context.type.getMethod]({ id }).frozen()
  if (frozen) throw new ForbiddenError('This link is frozen')
  const data = await getMetadata(id, context)
  await context.prisma[context.type.mutateMethod]({ id })
  pubsub.publish(context.type.channel, {
    [context.type.pubsubVariableName]: { ...data, workspaceId }
  })
  return data
})
