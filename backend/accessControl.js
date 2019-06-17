const { ForbiddenError } = require('apollo-server-core')

const Role = {
  GUEST: 0,
  STUDENT: 1,
  STAFF: 2,
  ADMIN: 3
}

const checkAccess = (ctx, {
  disallowAdmin = false,
  allowStudent = false,
  allowStaff = false,
  allowGuest = false
} = {}) => {
  if (ctx.role === Role.ADMIN && !disallowAdmin) return true
  if (ctx.role === Role.STUDENT && allowStudent) return true
  if (ctx.role === Role.STAFF && allowStaff) return true
  if (ctx.role === Role.GUEST && allowGuest) return true 
  throw new ForbiddenError("Access denied")
}

module.exports = { Role, checkAccess}