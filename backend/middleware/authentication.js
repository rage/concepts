const { AuthenticationError } = require('apollo-server-core')
const jwt = require('jsonwebtoken')
 
const authenticate = async(resolve, root, args, context, info) => {
  // If logging in, then pass on the request
  if (context.request.body.operationName === 'authenticateUser') {
    const result = await resolve(root, args, context, info)
    return result
  }

  let decodedToken
  try {
    decodedToken = jwt.verify(context.request.get('Authorization'), "secret")
  } catch (e) {
    return new AuthenticationError('Unauthorized')
  }
  console.log("Success...?")
  // const user = await context.prisma.user({ id: decodedToken.id })
  const result = await resolve(root, args, context, info)
  return result
}

module.exports = { authenticate }