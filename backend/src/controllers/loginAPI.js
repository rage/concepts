import { DOMParser, XMLSerializer } from 'xmldom'
import * as samlify from 'samlify'

export const loginAPIRedirect = async (req, res) => {
  try {
    const { entityID } = req.query
    const metadata = await getMetadata()
    const parsedMetaData = new DOMParser().parseFromString(metadata, 'text/xml')
    const redirectMetadata = Array.prototype.find.call(parsedMetaData.getElementsByTagName('EntityDescriptor'),
      (entity) =>
        Array.prototype.find.call(entity.attributes,
          (attr) => attr.name === 'entityID')
          .value === entityID)
    redirectMetadata.getElementsByTagName('IDPSSODescriptor')[0].setAttribute('WantAuthnRequestsSigned', 'true')
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

    const { id, context } = sp.createLoginRequest(idp, 'redirect')
    return res.redirect(context)
  } catch (e) {
    console.log('login failed, error: ', e)
  }}

export const loginAPIAssert = async (req, res) => {

}
