const { ForbiddenError } = require('apollo-server-core')

const Role = {
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

const checkAccess = (ctx, {
  disallowAdmin = false,
  allowStudent = false,
  allowStaff = false,
  allowGuest = false,
  verifyUser = false,
  userId = null
} = {}) => {
  if (ctx.role === Role.ADMIN && !disallowAdmin) return true
  if (verifyUser && userId) {
    checkUser(ctx, userId)
  }
  if (ctx.role === Role.STUDENT && allowStudent) return true
  if (ctx.role === Role.STAFF && allowStaff) return true
  if (ctx.role === Role.GUEST && allowGuest) return true
  throw new ForbiddenError('Access denied')
}

module.exports = { Role, checkAccess, checkUser }
