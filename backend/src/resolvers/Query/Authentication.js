import { getClientId } from '../../util/googleAuth'

const AuthenticationQueries = {
  googleClientId: getClientId,
  currentUser: (root, args, context) => context.user
}

export default AuthenticationQueries
