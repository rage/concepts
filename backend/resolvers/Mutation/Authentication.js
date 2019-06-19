const tmc = require('../../TMCAuthentication')
const jwt = require('jsonwebtoken')
const { AuthenticationError } = require('apollo-server-core')


const AuthenticationMutations = {
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
      const createdUser = context.prisma.createUser({
        tmcId: tmcId,
        role: administrator ? 'ADMIN' : 'STUDENT'
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