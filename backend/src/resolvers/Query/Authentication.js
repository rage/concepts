import { getClientId } from '../../util/googleAuth'
import sp, { HAKA_URL } from '../../saml/serviceProvider'

export const googleClientId = getClientId
export const hakaLoginUrl = () => sp ? { enabled: true, url: HAKA_URL } : { enabled: false }
export const currentUser = (_1, _2, { user }) => user
