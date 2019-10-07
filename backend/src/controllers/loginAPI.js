import qs from 'qs'

import { prisma } from '../../schema/generated/prisma-client'
import { signOrCreateUser } from '../resolvers/Mutation/Authentication'
import sp from '../saml/serviceProvider'
import getIDP from '../saml/identityProvider'

const loginFail = `${process.env.SAML_FINISH_URL}/fail`
export const responseUrl = (data) => `${process.env.SAML_FINISH_URL}#${qs.stringify(data)}`

const eduPersonPrincipalName = 'urn:oid:1.3.6.1.4.1.5923.1.1.1.6'
const funetEduPersonEPPNTimeStamp = 'urn:oid:1.3.6.1.4.1.16161.1.1.24'
const displayName = 'urn:oid:2.16.840.1.113730.3.1.241'

const idpCookie = 'concepts.saml.idp'

export const loginAPIRedirect = async (req, res) => {
  try {
    const { entityID } = req.query
    const idp = await getIDP(entityID)
    // FIXME this is somewhat hacky and might be bad, not sure
    sp.entityMeta.isAuthnRequestSigned = () => idp.entityMeta.isWantAuthnRequestsSigned()
    const { context } = sp.createLoginRequest(idp, 'redirect')
    res.cookie(idpCookie, entityID)
    return res.redirect(context)
  } catch (err) {
    console.log('login redirect error: ', err)
  }
}

export const loginAPIAssert = async (req, res) => {
  try {
    const entityID = req.cookies[idpCookie]
    const idp = await getIDP(entityID)
    // FIXME this is the same hack as above
    sp.entityMeta.isAuthnRequestSigned = () => idp.entityMeta.isWantAuthnRequestsSigned()
    const response = await sp.parseLoginResponse(idp, 'post', req)
    const {
      [eduPersonPrincipalName]: principalName,
      [funetEduPersonEPPNTimeStamp]: timestamp,
      [displayName]: dn
    } = response.extract.attributes
    const hakaId = timestamp ? `${timestamp}:${principalName}` : principalName
    const data = await signOrCreateUser({ hakaId }, {}, prisma)
    if (!data) {
      return res.redirect(loginFail)
    }
    data.user.username = dn
    return res.redirect(responseUrl(data))
  } catch (err) {
    console.log('login assert error:', err)
    return res.redirect(loginFail)
  }
}

export const loginAPIMetadata = async (req, res) => {
  res.header('Content-Type', 'text/xml').send(sp.getMetadata())
}
