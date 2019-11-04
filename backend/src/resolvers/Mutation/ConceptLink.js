import { ForbiddenError } from 'apollo-server-core'

import { checkAccess, Role, Privilege } from '../../util/accessControl'
import { nullShield } from '../../util/errors'
import { pubsub } from '../Subscription/config'
import { CONCEPT_LINK_CREATED, CONCEPT_LINK_DELETED } from '../Subscription/config/channels'

export const createConceptLink = async (root, { official, to, from, workspaceId }, context) => {
  await checkAccess(context, {
    minimumRole: Role.GUEST,
    minimumPrivilege: Privilege.EDIT,
    workspaceId
  })
  const linkExists = await context.prisma.$exists.conceptLink({
    AND: [
      { workspace: { id: workspaceId } },
      { to: { id: to } },
      { from: { id: from } }
    ]
  })
  if (linkExists) return null
  const newConceptLink = await context.prisma.createConceptLink({
    to: { connect: { id: to } },
    from: { connect: { id: from } },
    createdBy: { connect: { id: context.user.id } },
    workspace: { connect: { id: workspaceId } },
    official: Boolean(official)
  })
  pubsub.publish(CONCEPT_LINK_CREATED, { conceptLinkCreated: { ...newConceptLink, workspaceId } })
  return newConceptLink
}

export const deleteConceptLink = async (root, args, context) => {
  const { id: workspaceId } = nullShield(
    await context.prisma.conceptLink({ id: args.id }).workspace())
  await checkAccess(context, {
    minimumRole: Role.GUEST,
    minimumPrivilege: Privilege.EDIT,
    workspaceId
  })
  const frozen = await context.prisma.conceptLink({ id: args.id }).frozen()
  if (frozen) throw new ForbiddenError('This link is frozen')
  const { id: courseId } = await context.prisma.conceptLink({ id: args.id }).to().course()
  const { id: conceptId } = await context.prisma.conceptLink({ id: args.id }).to()
  await context.prisma.deleteConceptLink({
    id: args.id
  })
  const data = { id: args.id, courseId, conceptId }
  pubsub.publish(CONCEPT_LINK_DELETED, { conceptLinkDeleted: { ...data, workspaceId } })
  return data
}
