import { AuthenticationError } from 'apollo-server-core'
import jwt from 'jsonwebtoken'

import { Role } from '../util/accessControl'

export const authenticate = async (resolve, root, args, context, info) => {
  const prisma = context.prisma

  if (context.user || !context.request) {
    return await resolve(root, args, context, info)
  }
  const rawToken = context.request.header('Authorization')

  if (!rawToken) {
    context.role = Role.VISITOR
  } else {
    const token = rawToken.split(' ')[1]
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

  let user = null
  if (id) {
    user = await prisma.user({ id })
  } else {
    throw new AuthenticationError('Invalid token: No ID found')
  }

  if (!user) {
    context.role = Role.GUEST
  } else {
    context.user = user
    context.role = Role.fromString(user.role, Role.GUEST)
  }

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
