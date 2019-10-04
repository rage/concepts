import fs from 'fs'

import { DOMParser, XMLSerializer } from 'xmldom'
import * as samlify from 'samlify'
import axios from 'axios'
import qs from 'qs'

import { prisma } from '../../schema/generated/prisma-client'
import { signOrCreateUser } from '../resolvers/Mutation/Authentication'

// FIXME un-hardcode this
// const METADATA_URL = 'https://haka.funet.fi/metadata/haka-metadata.xml'
const METADATA_URL = 'https://haka.funet.fi/metadata/haka_test_metadata_signed.xml'

export const getMetadata = async () => {
  try {
    const response = await axios.get(METADATA_URL)
    return response.data
  } catch (e) {
    console.log('metadata fetch errors,', e)
  }
}

// FIXME this is apparently insecure for some reason
samlify.setSchemaValidator({
  validate: async () => 'skipped'
})

const sp = samlify.ServiceProvider({
  metadata: fs.readFileSync('./saml/metadata.xml'),
  encPrivateKey: fs.readFileSync('./saml/privatekey.pem'),
  privateKey: fs.readFileSync('./saml/privatekey.pem'),
  loginNameIDFormat: 'transient'
})
// FIXME this is some hack I added for the test server, shouldn't be used in production
sp.entityMeta.isAuthnRequestSigned = () => idp.entityMeta.isWantAuthnRequestsSigned()

// FIXME having this in a global variable seems very bad
let idp

export const loginAPIRedirect = async (req, res) => {
  try {
    const { entityID } = req.query
    const metadata = await getMetadata()
    const parsedMetaData = new DOMParser().parseFromString(metadata, 'text/xml')
    const ed = parsedMetaData.getElementsByTagName('EntityDescriptor')
    const redirectMetadata = Array.prototype.find.call(ed, entity =>
      Array.prototype.find.call(entity.attributes, attr =>
        attr.name === 'entityID'
      ).value === entityID)
    redirectMetadata.getElementsByTagName('IDPSSODescriptor')[0]
      .setAttribute('WantAuthnRequestsSigned', 'true')
    idp = samlify.IdentityProvider({
      metadata: new XMLSerializer().serializeToString(redirectMetadata),
      isAssertionEncrypted: true,
      wantMessageSigned: true,
      messageSigningOrder: 'encrypt-then-sign',
      signatureConfig: {
        prefix: 'ds',
        location: {
          reference: '/samlp:Response/saml:Issuer',
          action: 'after'
        }
      }
    })

    const { context } = sp.createLoginRequest(idp, 'redirect')
    return res.redirect(context)
  } catch (e) {
    console.log('login failed, error: ', e)
  }
}

// FIXME un-hardcode these
const loginFail = 'https://concepts.local/login/fail'
export const responseUrl = (data) => `https://concepts.local/login#${qs.stringify(data)}`

const eduPersonPrincipalName = 'urn:oid:1.3.6.1.4.1.5923.1.1.1.6'
const funetEduPersonEPPNTimeStamp = 'urn:oid:1.3.6.1.4.1.16161.1.1.24'
const displayName = 'urn:oid:2.16.840.1.113730.3.1.241'

export const loginAPIAssert = async (req, res) => {
  try {
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
  } catch (error) {
    console.log(error)
  }
}

export const loginAPIMetadata = async (req, res) => {
  res.header('Content-Type', 'text/xml').send(sp.getMetadata())
}
