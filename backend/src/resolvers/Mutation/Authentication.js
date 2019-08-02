const jwt = require('jsonwebtoken')
const { AuthenticationError } = require('apollo-server-core')

const mockWorkspace = require('../../static/mockWorkspace')
const tmc = require('../../TMCAuthentication')

const secretCharset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const makeSecret = length => Array.from({ length },
  () => secretCharset[Math.floor(Math.random() * secretCharset.length)]).join('')

const makeMockWorkspaceForUser = async (context, userId) => {
  const workspaceId = makeSecret(25)
  const templateWorkspace = mockWorkspace.data.workspace
  const makeNewId = (id) => id.substring(0, 13) + workspaceId.substring(13, 25)

  await context.prisma.createWorkspace({
    id: workspaceId,
    name: templateWorkspace.name,
    participants: {
      create: [{
        privilege: 'OWNER',
        user: {
          connect: { id: userId }
        }
      }]
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

const AuthenticationMutations = {
  async createGuest(root, args, context) {
    const guest = await context.prisma.createUser({
      role: 'GUEST'
    })
    const token = jwt.sign({
      role: guest.role,
      id: guest.id
    },
    process.env.SECRET)
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
    const user = await context.prisma.user({ tmcId })

    // New user
    if (!user) {
      const userData = { tmcId }
      if (userDetails && userDetails.administrator) {
        userData.role = 'ADMIN'
      } else {
        userData.role = 'STAFF'
      }
      const createdUser = await context.prisma.createUser(userData)
      const token = jwt.sign({ role: createdUser.role, id: createdUser.id }, process.env.SECRET)
      await makeMockWorkspaceForUser(context, createdUser.id)
      return {
        token,
        user: createdUser
      }
    }

    // Existing user
    const token = jwt.sign({ role: user.role, id: user.id }, process.env.SECRET)
    return {
      token,
      user
    }
  }
}

module.exports = AuthenticationMutations
