import { Privilege, Role } from './permissions'
import makeSecret from './secret'
import mockWorkspace from '../static/mockWorkspace'
import bloom from '../static/bloom'
import { getLastSeenMeta } from '../middleware/authentication'

export const makeMockWorkspaceForUser = async (prisma, userId) => {
  const workspaceId = makeSecret(25)
  const templateWorkspace = mockWorkspace.data.workspace
  const makeNewId = (id) => id.substring(0, 13) + workspaceId.substring(13, 25)

  await prisma.createWorkspace({
    id: workspaceId,
    name: templateWorkspace.name,
    createdBy: { connect: { id: userId } },
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
        description: course.description,
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

const createUser = async (userData, context) => {
  const token = makeSecret(64)
  userData.tokens = {
    create: [{
      token,
      ...getLastSeenMeta(context)
    }]
  }
  const user = await context.prisma.createUser(userData)
  await makeMockWorkspaceForUser(context.prisma, user.id)
  return { user, token }
}

const createToken = async (user, context) => {
  const token = makeSecret(64)
  await context.prisma.createAccessToken({
    token,
    user: { connect: { id: user.id } },
    ...getLastSeenMeta(context)
  })
  return token
}

const defaultCreateDetails = {
  role: Role.STUDENT.toString()
}

export const signOrCreateUser = async (where, createDetails, context) => {
  const user = await context.prisma.user(where)
  if (!user) {
    return await createUser({ ...defaultCreateDetails, ...where, ...createDetails }, context)
  }
  const token = await createToken(user, context)
  return { user, token }
}
