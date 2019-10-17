import jwt from 'jsonwebtoken'
import { AuthenticationError } from 'apollo-server-core'

import { Role, Privilege } from '../../util/accessControl'
import { verify as verifyGoogle } from '../../util/googleAuth'
import mockWorkspace from '../../static/mockWorkspace'
import tmc from '../../util/tmcAuthentication'
import makeSecret from '../../util/secret'
import { parseToken } from '../../middleware/authentication'
import { bloom } from './Workspace'

const makeMockWorkspaceForUser = async (prisma, userId) => {
  const workspaceId = makeSecret(25)
  const templateWorkspace = mockWorkspace.data.workspace
  const makeNewId = (id) => id.substring(0, 13) + workspaceId.substring(13, 25)

  await prisma.createWorkspace({
    id: workspaceId,
    name: templateWorkspace.name,
    participants: {
      create: [{
        privilege: Privilege.OWNER.toString(),
        user: {
          connect: { id: userId }
        }
      }]
    },
    conceptTags: {
      create: bloom
    },
    courses: {
      create: templateWorkspace.courses.map(course => ({
        id: makeNewId(course.id),
        name: course.name,
        createdBy: { connect: { id: userId } },
        concepts: {
          create: course.concepts.map(concept => ({
            id: makeNewId(concept.id),
            name: concept.name,
            description: concept.description,
            createdBy: { connect: { id: userId } },
            workspace: { connect: { id: workspaceId } }
          }))
        }
      }))
    },
    conceptLinks: {
      create: templateWorkspace.conceptLinks.map(link => ({
        createdBy: { connect: { id: userId } },
        from: { connect: { id: makeNewId(link.from.id) } },
        to: { connect: { id: makeNewId(link.to.id) } }
      }))
    },
    courseLinks: {
      create: templateWorkspace.courseLinks.map(link => ({
        createdBy: { connect: { id: userId } },
        from: { connect: { id: makeNewId(link.from.id) } },
        to: { connect: { id: makeNewId(link.to.id) } }
      }))
    }
  })
}

const createUser = async (userData, prisma) => {
  const createdUser = await prisma.createUser(userData)
  await makeMockWorkspaceForUser(prisma, createdUser.id)
  return createdUser
}

const signUser = user => jwt.sign({ role: user.role, id: user.id }, process.env.SECRET)

const defaultCreateDetails = {
  role: Role.STUDENT.toString()
}

export const signOrCreateUser = async (where, createDetails, prisma) => {
  const user = await prisma.user(where)
    || await createUser({ ...defaultCreateDetails, ...where, ...createDetails }, prisma)
  return { user, token: signUser(user) }
}

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
  const titleType = type.substr(0, 1).toUpperCase() + type.substr(1).toLowerCase()
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

const AuthenticationMutations = {
  async createGuest(root, args, context) {
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
  },
  async login(root, args, context) {
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
  },
  async loginGoogle(root, args, context) {
    let data
    try {
      data = await verifyGoogle(args.idToken)
    } catch {
      return new AuthenticationError('Invalid Google token')
    }
    return await signOrCreateUser({ googleId: data.sub }, {}, context.prisma)
  },
  async mergeUser(root, { accessToken }, context) {
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
        googleId: null
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
  },
  async disconnectAuth(root, { authType }, context) {
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
}

export default AuthenticationMutations
