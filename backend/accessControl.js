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
  INVITE: 'INVITE',
  READ: 'READ',
  NONE: null
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

const checkPrivilegeInt = async (ctx, { minimumPrivilege, workspaceId, projectId }) => {
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

  if (privilegeToInt(privilege) < privilegeToInt(minimumPrivilege)) {
    throw new ForbiddenError('Access denied')
  }

  return true
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
    await checkPrivilegeInt(ctx, { minimumPrivilege, workspaceId, projectId })
  }
  return true
}

module.exports = { Role, Privilege, checkAccess, checkUser, checkPrivilege: checkPrivilegeInt }
