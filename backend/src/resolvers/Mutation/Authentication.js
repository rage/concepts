import jwt from 'jsonwebtoken'
import { AuthenticationError } from 'apollo-server-core'

import { Role } from '../../util/accessControl'
import { verify as verifyGoogle } from '../../util/googleAuth'
import * as tmc from '../../util/tmcAuthentication'
import { makeMockWorkspaceForUser, signOrCreateUser } from '../../util/createUser'
import { parseToken } from '../../middleware/authentication'

const getData = async (prisma, type, titleType, id) => new Map(
  (await prisma
    .user({ id })[`${type}Participations`]()
    .$fragment(`
      fragment ${titleType}Id on ${titleType}Participant {
        ${type} {
          id
        }
        id
      }
    `)
  ).map(pcp => [pcp[type].id, pcp.id])
)

const mergeData = async (prisma, oldUserId, curUserId, type) => {
  const titleType = type.toTitleCase()
  const oldData = await getData(prisma, type, titleType, oldUserId)
  const existingData = await getData(prisma, type, titleType, curUserId)
  for (const existing of existingData.keys()) {
    oldData.delete(existing)
  }
  for (const id of oldData.values()) {
    await prisma[`update${titleType}Participant`]({
      where: { id },
      data: {
        user: { connect: { id: curUserId } }
      }
    })
  }
}

export const createGuest = async (root, args, context) => {
  const guest = await context.prisma.createUser({
    role: Role.GUEST.toString()
  })
  const token = jwt.sign({
    role: guest.role,
    id: guest.id
  }, process.env.SECRET)
  await makeMockWorkspaceForUser(context.prisma, guest.id)
  return {
    token,
    user: guest
  }
}

export const login = async (root, args, context) => {
  // Get user details from tmc
  let userDetails
  try {
    userDetails = await tmc.userDetails(args.tmcToken)
  } catch (e) {
    return new AuthenticationError('Invalid tmc-token')
  }
  const tmcId = userDetails.id
  return await signOrCreateUser({ tmcId }, {
    role: (userDetails?.administrator ? Role.ADMIN : Role.STUDENT).toString()
  }, context.prisma)
}

export const loginGoogle = async (root, args, context) => {
  let data
  try {
    data = await verifyGoogle(args.idToken)
  } catch {
    return new AuthenticationError('Invalid Google token')
  }
  return await signOrCreateUser({ googleId: data.sub }, {}, context.prisma)
}

export const mergeUser = async (root, { accessToken }, context) => {
  if (!context.user) {
    return new AuthenticationError('Must be logged in')
  }
  const oldUserId = parseToken(accessToken)
  const curUserId = context.user.id

  await mergeData(context.prisma, oldUserId, curUserId, 'workspace')
  await mergeData(context.prisma, oldUserId, curUserId, 'project')

  const oldUser = await context.prisma.user({ id: oldUserId })
  const curUser = await context.prisma.user({ id: curUserId })

  // TODO this leaves a partly orphaned user, we should instead replace ALL references to the
  //      user with the new user and then delete this user.
  await context.prisma.updateUser({
    where: {
      id: oldUserId
    },
    data: {
      tmcId: null,
      hakaId: null,
      googleId: null,
      deactivated: true
    }
  })

  const oldRole = Role.fromString(oldUser.role)
  const curRole = Role.fromString(curUser.role)
  return await context.prisma.updateUser({
    where: { id: curUserId },
    data: {
      role: (oldRole > curRole ? oldRole : curRole).toString(),
      tmcId: curUser.tmcId || oldUser.tmcId,
      hakaId: curUser.hakaId || oldUser.hakaId,
      googleId: curUser.googleId || oldUser.googleId
    }
  })
}

export const disconnectAuth = async (root, { authType }, context) => {
  if (!context.user) {
    return new AuthenticationError('Must be logged in')
  }

  const data = {}
  if (authType === 'TMC') {
    data.tmcId = null
  } else if (authType === 'HAKA') {
    data.hakaId = null
  } else if (authType === 'GOOGLE') {
    data.googleId = null
  }

  return await context.prisma.updateUser({
    where: { id: context.user.id },
    data
  })
}
