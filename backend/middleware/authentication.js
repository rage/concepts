const { AuthenticationError } = require('apollo-server-core')
const { Role } = require('../accessControl')
const jwt = require('jsonwebtoken')

const authenticate = async (resolve, root, args, context, info) => {
  const prisma = context.prisma

  if (context.user) {
    const result = await resolve(root, args, context, info)
    return result
  }

  let rawToken = null
  if (context.request) {
    rawToken = context.request.get('Authorization')
  }

  if (!rawToken) {
    context.role = Role.GUEST
  } else {
    await getUser(rawToken, context, prisma)
  }

  const result = await resolve(root, args, context, info)
  return result
}

const getUser = async (token, context, prisma) => {
  try {
    decodedToken = jwt.verify(token, "secret")
  } catch (e) {
    console.log(e)
    throw new AuthenticationError("Bad token")
  }
  let user = null
  if (decodedToken) {
    user = prisma.user({ id: decodedToken.id })
  }

  if (!user) {
    context.role = Role.GUEST
  }

  context.user = user
  if (user.role === 'ADMIN') {
    context.role = Role.ADMIN
  } else {
    context.role = Role.USER
  }
}

module.exports = { authenticate }