const tmc = require('../../TMCAuthentication')
const jwt = require('jsonwebtoken')
const { AuthenticationError } = require('apollo-server-core')


const AuthenticationMutations = {
  async createGuest(root, args, context) {
    const guest = await context.prisma.createUser({
      role: 'GUEST'
    })
    const token = jwt.sign({ 
      role: guest.role, 
      id: guest.id }, 
    process.env.SECRET)
    
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

    let tmcId = userDetails.id
    let administrator = userDetails.administrator
    const user = await context.prisma.user({ tmcId })

    // New user
    if (!user) {
      const createdUser = await context.prisma.createUser({
        tmcId: tmcId,
        role: 'STAFF'
      })
      const token = jwt.sign({ role: createdUser.role, id: createdUser.id }, process.env.SECRET)
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
