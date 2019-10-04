import jwt from 'jsonwebtoken'
import { AuthenticationError } from 'apollo-server-core'

import { Role, Privilege } from '../../util/accessControl'
import mockWorkspace from '../../static/mockWorkspace'
import tmc from '../../util/tmcAuthentication'
import makeSecret from '../../util/secret'
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

const AuthenticationMutations = {
  async createGuest(root, args, context) {
    const guest = await context.prisma.createUser({
      role: Role.GUEST.toString()
    })
    const token = jwt.sign({
      role: guest.role,
      id: guest.id
    }, process.env.SECRET)
    await makeMockWorkspaceForUser(context, guest.id)
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
  }
}

export default AuthenticationMutations
