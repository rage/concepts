const { ForbiddenError } = require('apollo-server-core')

const Role = {
  VISITOR: 'VISITOR',
  GUEST: 'GUEST',
  STUDENT: 'STUDENT',
  STAFF: 'STAFF',
  ADMIN: 'ADMIN'
}

const roleToInt = role => {
  switch (role) {
  case Role.ADMIN:
    return 4
  case Role.STAFF:
    return 3
  case Role.STUDENT:
    return 2
  case Role.GUEST:
    return 1
  case Role.VISITOR:
  default:
    return 0
  }
}

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

const Privilege = {
  OWNER: 'OWNER',
  EDIT: 'EDIT',
  READ: 'READ',
  CLONE: 'CLONE',
  NONE: null
}

const privilegeToInt = privilege => {
  switch (privilege) {
  case Privilege.OWNER:
    return 4
  case Privilege.EDIT:
    return 3
  case Privilege.READ:
    return 2
  case Privilege.CLONE:
    return 1
  case Privilege.NONE:
  default:
    return 0
  }
}

const privilegeToChar = privilege => {
  switch (privilege) {
  case Privilege.OWNER:
    return 'o'
  case Privilege.EDIT:
    return 'e'
  case Privilege.READ:
    return 'r'
  case Privilege.CLONE:
    return 'c'
  case Privilege.NONE:
  default:
    return '0'
  }
}

const readPrivilege = ws => privilegeToInt(ws && ws.participants[0] && ws.participants[0].privilege)

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
    throw Error('Invalid checkPrivilege call (workspace or project is null)')
  }

  if (readPrivilege(resp[type]) >= privilegeToInt(minimumPrivilege)) {
    return true
  } else if (type === 'workspace') {
    const proRes = await ctx.prisma.$graphql(projectPrivilegeQuery, {
      id: workspaceId,
      userId: ctx.user.id
    })

    return readPrivilege(proRes.workspace.sourceProject) >= privilegeToInt(minimumPrivilege)
      || readPrivilege(proRes.workspace.asTemplate) >= privilegeToInt(minimumPrivilege)
  } else {
    return false
  }
}

const checkAccess = async (ctx, {
  minimumRole = null,
  minimumPrivilege = null,
  workspaceId, projectId
}) => {
  if (minimumRole !== null && roleToInt(ctx.role) < roleToInt(minimumRole)) {
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
  Role, Privilege, checkAccess, checkUser, privilegeToInt, privilegeToChar, roleToInt,
  checkPrivilege: checkPrivilegeInt
}
