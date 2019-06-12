const { ForbiddenError } = require('apollo-server-core')

const Role = {
  GUEST: 0,
  USER: 1,
  ADMIN: 2
}

const checkAccess = (ctx, {
  disallowAdmin = false,
  allowUser = false,
  allowGuest = false
} = {}) => {
  if (ctx.role === Role.ADMIN && !disallowAdmin) return true
  if (ctx.role === Role.USER && allowUser) return true
  if (ctx.role === Role.GUEST && allowGuest) return true 
  throw new ForbiddenError("Access denied")
}

module.exports = { Role, checkAccess}