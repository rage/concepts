import { ForbiddenError } from 'apollo-server-core'

import { NotFoundError } from './errors'
import { readPrivilege } from './permissions'

export { Privilege, Role } from './permissions'

export const checkUser = (ctx, userId) => {
  if (ctx.user.id !== userId) {
    throw new ForbiddenError('Unauthorised user')
  }
  return true
}

const privilegeQuery = `
query($id: ID!, $userId: ID!) {
  %s(where: { id: $id }) {
    participants(where: { user: { id: $userId } }) {
      privilege
    }
  }
}
`

const projectPrivilegeQuery = `
query($id: ID!, $userId: ID!) {
  workspace(where: { id: $id} ) {
    asTemplate {
      participants(where: { user: { id: $userId } }) {
        privilege
      }
    }
    asMerge {
      participants(where: { user: { id: $userId } }) {
        privilege
      }
    }
    sourceProject {
      participants(where: { user: { id: $userId } }) {
        privilege
      }
    }
  }
}
`

const privilegeQueryTyped = {
  workspace: privilegeQuery.replace('%s', 'workspace'),
  project: privilegeQuery.replace('%s', 'project')
}

export const checkPrivilege = async (ctx, { minimumPrivilege, workspaceId, projectId }) => {
  if (!workspaceId && !projectId) {
    throw Error('Invalid checkPrivilege call (missing workspace or project)')
  }
  const type = workspaceId ? 'workspace' : 'project'
  const resp = await ctx.prisma.$graphql(privilegeQueryTyped[type], {
    id: workspaceId || projectId,
    userId: ctx.user.id
  })
  if (!resp[type]) {
    throw new NotFoundError(type)
  }

  if (readPrivilege(resp[type]) >= minimumPrivilege) {
    return true
  } else if (type === 'workspace') {
    const proRes = await ctx.prisma.$graphql(projectPrivilegeQuery, {
      id: workspaceId,
      userId: ctx.user.id
    })

    return readPrivilege(proRes.workspace.sourceProject) >= minimumPrivilege
      || readPrivilege(proRes.workspace.asTemplate) >= minimumPrivilege
      || readPrivilege(proRes.workspace.asMerge) >= minimumPrivilege
  } else {
    return false
  }
}

export const checkAccess = async (ctx, {
  minimumRole = null,
  minimumPrivilege = null,
  workspaceId, projectId
}) => {
  if (minimumRole !== null && ctx.role < minimumRole) {
    throw new ForbiddenError('Access denied')
  }
  if (minimumPrivilege !== null) {
    if (!await checkPrivilege(ctx, { minimumPrivilege, workspaceId, projectId })) {
      throw new ForbiddenError('Access denied')
    }
  }
  return true
}

export const canViewWorkspace = (ctx, workspaceId) =>
  ctx.user && checkPrivilege(ctx, { minimumPrivilege: Privilege.VIEW, workspaceId })

export const canViewProject = (ctx, projectId) =>
  ctx.user && checkPrivilege(ctx, { minimumPrivilege: Privilege.VIEW, projectId })

export const withViewPrivilege = (type, id, cb) => async (payload, variables, ctx, ...rest) => {
  const hasPrivilege = type === 'w'
    ? await canViewWorkspace(ctx, id)
    : await canViewProject(ctx, id)
  const callbackResult = cb(payload, variables, ctx, ...rest)
  return hasPrivilege && callbackResult
}
