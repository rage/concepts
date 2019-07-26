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
  case 'OWNER':
    return 4
  case 'EDIT':
    return 3
  case 'READ':
    return 2
  case 'CLONE':
    return 1
  default:
    return 0
  }
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
    throw Error('Invalid checkPrivilege call (workspace or project is null)')
  } else if (!resp[type].participants[0]) {
    return false
  }
  const privilege = resp[type].participants[0].privilege

  return privilegeToInt(privilege) >= privilegeToInt(minimumPrivilege)
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
  Role, Privilege, checkAccess, checkUser, privilegeToInt, roleToInt,
  checkPrivilege: checkPrivilegeInt
}
