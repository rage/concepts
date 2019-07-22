const { ForbiddenError } = require('apollo-server-core')

const Role = {
  VISITOR: 'VISITOR',
  GUEST: 'GUEST',
  STUDENT: 'STUDENT',
  STAFF: 'STAFF',
  ADMIN: 'ADMIN'
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

const privilegeToInt = privilege => {
  switch (privilege) {
  case 'OWNER':
    return 4
  case 'EDIT':
    return 3
  case 'INVITE':
    return 2
  case 'READ':
    return 1
  default:
    return 0
  }
}

const checkPrivilegeInt = async (ctx, { requiredPrivilege, workspaceId, projectId }) => {
  if (!workspaceId && !projectId) {
    throw Error('Invalid checkPrivilege call')
  }
  const type = workspaceId ? 'workspace' : 'project'
  const resp = await ctx.prisma.$graphql(privilegeQueryTyped[type], {
    id: workspaceId || projectId,
    userId: ctx.user.id
  })
  if (!resp[type].participants[0]) {
    throw new ForbiddenError('Access denied')
  }
  const privilege = resp[type].participants[0].privilege

  if (privilegeToInt(privilege) < privilegeToInt(requiredPrivilege)) {
    throw new ForbiddenError('Access denied')
  }

  return true
}

const checkAccess = async (ctx, {
  disallowAdmin = false,
  allowVisitor = false,
  allowStudent = false,
  allowStaff = false,
  allowGuest = false,
  checkPrivilege = null
} = {}) => {
  if (ctx.role === Role.ADMIN && !disallowAdmin) return true
  if (ctx.role === Role.STUDENT && allowStudent) return true
  if (ctx.role === Role.STAFF && allowStaff) return true
  if (ctx.role === Role.GUEST && allowGuest) return true
  if (ctx.role === Role.VISITOR && allowVisitor) return true
  if (checkPrivilege) {
    await checkPrivilegeInt(ctx, checkPrivilege)
  }
  throw new ForbiddenError('Access denied')
}

module.exports = { Role, checkAccess, checkUser, checkPrivilege: checkPrivilegeInt }
