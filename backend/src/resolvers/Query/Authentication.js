import { getClientId } from '../../util/googleAuth'
import sp, { HAKA_URL } from '../../saml/serviceProvider'

const AuthenticationQueries = {
  googleClientId: getClientId,
  hakaLoginUrl: () => sp ? { enabled: true, url: HAKA_URL } : { enabled: false },
  currentUser: (root, args, context) => context.user
}

export default AuthenticationQueries
