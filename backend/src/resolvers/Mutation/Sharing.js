import { checkAccess, Role, Privilege } from '../../util/accessControl'
import { nullShield } from '../../util/errors'
import makeSecret from '../../util/secret'
import {
  WORKSPACE_MEMBER_CREATED,
  PROJECT_MEMBER_CREATED,
  PROJECT_MEMBER_DELETED,
  WORKSPACE_MEMBER_DELETED,
  WORKSPACE_MEMBER_UPDATED,
  PROJECT_MEMBER_UPDATED
} from '../Subscription/channels'
import pubsub from '../Subscription/pubsub'

export const createWorkspaceToken = async (root, { workspaceId, privilege }, context) => {
  await checkAccess(context, {
    minimumRole: Role.GUEST,
    minimumPrivilege: Privilege.OWNER,
    workspaceId
  })
  return await context.prisma.createWorkspaceToken({
    id: `w${Privilege.fromString(privilege).char}${makeSecret(23)}`,
    privilege,
    workspace: {
      connect: { id: workspaceId }
    },
    revoked: false
  })
}

export const createProjectToken = async (root, { projectId, privilege }, context) => {
  await checkAccess(context, {
    minimumRole: Role.GUEST,
    minimumPrivilege: Privilege.OWNER,
    projectId
  })
  return await context.prisma.createProjectToken({
    id: `p${Privilege.fromString(privilege).char}${makeSecret(23)}`,
    privilege,
    project: {
      connect: { id: projectId }
    },
    revoked: false
  })
}

export const deleteToken = async (root, { id }, context) => {
  // TODO revoke instead of deleting
  if (id[0] === 'w') {
    const { id: workspaceId } = nullShield(
      await context.prisma.workspaceToken({ id }).workspace())
    await checkAccess(context, {
      minimumRole: Role.GUEST,
      minimumPrivilege: Privilege.OWNER,
      workspaceId
    })
    return await context.prisma.deleteWorkspaceToken({
      id
    })
  } else if (id[0] === 'p') {
    const { id: projectId } = nullShield(await context.prisma.projectToken({ id }).project(),
      'project')
    await checkAccess(context, {
      minimumRole: Role.GUEST,
      minimumPrivilege: Privilege.OWNER,
      projectId
    })
    return await context.prisma.deleteProjectToken({
      id
    })
  } else {
    throw Error('invalid share token')
  }
}

export const useToken = async (root, { id }, context) => {
  await checkAccess(context, {
    minimumRole: Role.GUEST
  })
  if (id[0] === 'w') {
    const privilege = await context.prisma.workspaceToken({ id }).privilege()
    const workspace = await context.prisma.workspaceToken({ id }).workspace()
    const participant = await context.prisma.createWorkspaceParticipant({
      privilege,
      workspace: { connect: { id: workspace.id } },
      user: { connect: { id: context.user.id } },
      token: { connect: { id } }
    })
    pubsub.publish(WORKSPACE_MEMBER_CREATED, {
      workspaceMemberCreated: {
        ...participant,
        userId: context.user.id,
        workspaceId: workspace.id
      }
    })
    return participant
  } else if (id[0] === 'p') {
    const privilege = await context.prisma.projectToken({ id }).privilege()
    const project = await context.prisma.projectToken({ id }).project()
    const participant = await context.prisma.createProjectParticipant({
      privilege,
      project: { connect: { id: project.id } },
      user: { connect: { id: context.user.id } },
      token: { connect: { id } }
    })
    pubsub.publish(PROJECT_MEMBER_CREATED, {
      projectMemberCreated: {
        ...participant,
        userId: context.user.id,
        projectId: project.id
      }
    })
    return participant
  } else {
    throw Error('invalid share token')
  }
}

export const updateParticipant = async (root, { type, id, privilege }, context) => {
  if (type === 'PROJECT') {
    const { id: projectId } = nullShield(
      await context.prisma.projectParticipant({ id }).project(), 'project')
    await checkAccess(context, { projectId, minimumPrivilege: Privilege.OWNER })
    const updatedProjectParticipant = await context.prisma.updateProjectParticipant({
      where: { id },
      data: { privilege }
    })
    pubsub.publish(PROJECT_MEMBER_UPDATED, {
      projectMemberUpdated: {
        ...updatedProjectParticipant,
        projectId
      }
    })
    return {
      id,
      privilege
    }
  } else if (type === 'WORKSPACE') {
    const workspace = nullShield(
      await context.prisma.workspaceParticipant({ id }).workspace())
    const workspaceId = workspace.id
    await checkAccess(context, { workspaceId, minimumPrivilege: Privilege.OWNER })
    const updatedWorkspaceParticipant = await context.prisma.updateWorkspaceParticipant({
      where: { id },
      data: { privilege }
    })
    pubsub.publish(WORKSPACE_MEMBER_UPDATED, {
      workspaceMemberUpdated: {
        ...updatedWorkspaceParticipant,
        workspaceId
      }
    })
    return {
      id,
      privilege
    }
  } else {
    throw Error('invalid participant type')
  }
}

export const deleteParticipant = async (root, { type, id }, context) => {
  if (type === 'PROJECT') {
    const { id: projectId } = nullShield(
      await context.prisma.projectParticipant({ id }).project(), 'project')
    await checkAccess(context, { projectId, minimumPrivilege: Privilege.OWNER })
    const deletedProjectParticipant = await context.prisma.deleteProjectParticipant({ id })
    pubsub.publish(PROJECT_MEMBER_DELETED, {
      projectMemberDeleted: {
        ...deletedProjectParticipant,
        projectId
      }
    })
    return id
  } else if (type === 'WORKSPACE') {
    const { id: workspaceId } = nullShield(
      await context.prisma.workspaceParticipant({ id }).workspace())
    await checkAccess(context, { workspaceId, minimumPrivilege: Privilege.OWNER })
    const deletedWorkspaceParticipant = await context.prisma.deleteWorkspaceParticipant({ id })
    pubsub.publish(WORKSPACE_MEMBER_DELETED, {
      workspaceMemberDeleted: {
        ...deletedWorkspaceParticipant,
        workspaceId
      }
    })
    return id
  } else {
    throw Error('invalid participant type')
  }
}
