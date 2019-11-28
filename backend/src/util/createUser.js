import jwt from 'jsonwebtoken'

import { Privilege, Role } from './permissions'
import makeSecret from './secret'
import mockWorkspace from '../static/mockWorkspace'
import bloom from '../static/bloom'

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
