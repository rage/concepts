import { AuthenticationError } from 'apollo-server-core'

import { Role } from '../util/accessControl'

export const authenticate = async (resolve, root, args, context, info) => {
  const prisma = context.prisma

  if (context.user) {
    return await resolve(root, args, context, info)
  }

  let rawToken
  if (context.request === undefined) {
    // WebSocket
    rawToken = context.connection.context.token
  } else {
    // HTTP
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

export const getUser = async (token, context, prisma) => {
  const user = await prisma.accessToken({ token }).user()
  if (!user) {
    throw new AuthenticationError('Invalid access token')
  } else if (user.deactivated) {
    throw new AuthenticationError('Invalid token: user is deactivated')
  }

  context.token = token
  context.user = user
  context.role = Role.fromString(user.role, Role.GUEST)

  // Update token last seen location
  await prisma.updateAccessToken({
    where: { token },
    data: getLastSeenMeta(context)
  })
}

export const getLastSeenMeta = context => {
  if (context.request) {
    return {
      lastSeenAgent: context.request.header('User-Agent'),
      lastSeenAddress: context.request.header('X-Forwarded-For')
        || context.request.connection.remoteAddress
    }
  } else if (context.connection) {
    // TODO websocket last seen address
  }
  return {}
}
