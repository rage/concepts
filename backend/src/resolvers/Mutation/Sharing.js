import { checkAccess, Role, Privilege } from '../../util/accessControl'
import { nullShield } from '../../util/errors'
import makeSecret from '../../util/secret'

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
    return await context.prisma.createWorkspaceParticipant({
      privilege,
      workspace: { connect: { id: workspace.id } },
      user: { connect: { id: context.user.id } },
      token: { connect: { id } }
    })
  } else if (id[0] === 'p') {
    const privilege = await context.prisma.projectToken({ id }).privilege()
    const project = await context.prisma.projectToken({ id }).project()
    return await context.prisma.createProjectParticipant({
      privilege,
      project: { connect: { id: project.id } },
      user: { connect: { id: context.user.id } },
      token: { connect: { id } }
    })
  } else {
    throw Error('invalid share token')
  }
}

export const updateParticipant = async (root, { type, id, privilege }, context) => {
  if (type === 'PROJECT') {
    const { id: projectId } = nullShield(
      await context.prisma.projectParticipant({ id }).project(), 'project')
    await checkAccess(context, { projectId, minimumPrivilege: Privilege.OWNER })
    await context.prisma.updateProjectParticipant({
      where: { id },
      data: { privilege }
    })
    return {
      id,
      privilege
    }
  } else if (type === 'WORKSPACE') {
    const { id: workspaceId } = nullShield(
      await context.prisma.workspaceParticipant({ id }).workspace())
    await checkAccess(context, { workspaceId, minimumPrivilege: Privilege.OWNER })
    await context.prisma.updateWorkspaceParticipant({
      where: { id },
      data: { privilege }
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
    await context.prisma.deleteProjectParticipant({ id })
    return id
  } else if (type === 'WORKSPACE') {
    const { id: workspaceId } = nullShield(
      await context.prisma.workspaceParticipant({ id }).workspace())
    await checkAccess(context, { workspaceId, minimumPrivilege: Privilege.OWNER })
    await context.prisma.deleteWorkspaceParticipant({ id })
    return id
  } else {
    throw Error('invalid participant type')
  }
}
