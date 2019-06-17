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
    const token = rawToken.split(' ')[1]
    await getUser(token, context, prisma)
  }

  const result = await resolve(root, args, context, info)
  return result
}

const getUser = async (token, context, prisma) => {
  try {
    decodedToken = jwt.verify(token, process.env.SECRET)
  } catch (e) {
    console.log(e)
    throw new AuthenticationError("Bad token")
  }
  let user = null
  if (decodedToken && decodedToken.id) {
    user = await prisma.user({ id: decodedToken.id })
  } else {
    throw new AuthenticationError("Invalid token: No ID found")
  }

  if (!user) {
    context.role = Role.GUEST
  }

  context.user = user
  if (user.role === 'ADMIN') {
    context.role = Role.ADMIN
  } else {
    context.role = Role.STUDENT
  }
}

module.exports = { authenticate }