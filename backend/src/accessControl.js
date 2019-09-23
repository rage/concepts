const { ForbiddenError } = require('apollo-server-core')

const { NotFoundError } = require('./errors')
const { Privilege, readPrivilege, Role } = require('./permissions')

const checkUser = (ctx, userId) => {
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

const checkPrivilegeInt = async (ctx, { minimumPrivilege, workspaceId, projectId }) => {
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

  if (readPrivilege(resp[type]).level >= minimumPrivilege.level) {
    return true
  } else if (type === 'workspace') {
    const proRes = await ctx.prisma.$graphql(projectPrivilegeQuery, {
      id: workspaceId,
      userId: ctx.user.id
    })

    return readPrivilege(proRes.workspace.sourceProject).level >= minimumPrivilege.level
      || readPrivilege(proRes.workspace.asTemplate).level >= minimumPrivilege.level
      || readPrivilege(proRes.workspace.asMerge).level >= minimumPrivilege.level
  } else {
    return false
  }
}

const checkAccess = async (ctx, {
  minimumRole = null,
  minimumPrivilege = null,
  workspaceId, projectId
}) => {
  if (minimumRole !== null && ctx.role.value < minimumRole.value) {
    throw new ForbiddenError('Access denied')
  }
  if (minimumPrivilege !== null) {
    if (!(await checkPrivilegeInt(ctx, { minimumPrivilege, workspaceId, projectId }))) {
      throw new ForbiddenError('Access denied')
    }
  }
  return true
}

module.exports = {
  Role, Privilege, checkAccess, checkUser,
  checkPrivilege: checkPrivilegeInt
}
