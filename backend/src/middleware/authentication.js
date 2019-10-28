import { AuthenticationError } from 'apollo-server-core'
import jwt from 'jsonwebtoken'

import { Role } from '../util/accessControl'

export const authenticate = async (resolve, root, args, context, info) => {
  const prisma = context.prisma

  if (context.user) {
    return await resolve(root, args, context, info)
  }

  let rawToken
  if (context.request === undefined) {
    rawToken = context.connection.context.token
  } else {
    rawToken = context.request.header('Authorization')
  }

  if (!rawToken) {
    context.role = Role.VISITOR
  } else {
    const [, token] = rawToken.split(' ')
    await getUser(token, context, prisma)
  }

  return await resolve(root, args, context, info)
}

export const parseToken = token => {
  try {
    return jwt.verify(token, process.env.SECRET).id
  } catch (e) {
    console.log(e)
    throw new AuthenticationError('Bad token')
  }
}

const getUser = async (token, context, prisma) => {
  const id = parseToken(token)
  if (!id) {
    throw new AuthenticationError('Invalid token: no ID found')
  }
  const user = await prisma.user({ id })
  if (!user) {
    throw new AuthenticationError('Invalid token: user not found')
  } else if (user.deactivated) {
    throw new AuthenticationError('Invalid token: user is deactivated')
  }

  context.user = user
  context.role = Role.fromString(user.role, Role.GUEST)

  // Update last activity of the user
  await prisma.updateUser({
    where: {
      id: context.user.id
    },
    data: {
      lastActivity: new Date().toISOString()
    }
  })
}
