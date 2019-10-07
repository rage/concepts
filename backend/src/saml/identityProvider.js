import fs from 'fs'
import path from 'path'

import { DOMParser, XMLSerializer } from 'xmldom'
import { SignedXml, FileKeyInfo, xpath } from 'xml-crypto'
import * as samlify from 'samlify'
import axios from 'axios'

const SAML_DIR = process.env.SAML_DIR || './saml'

const METADATA_URL = process.env.SAML_METADATA_URL
const IDP_METADATA_KEY = new FileKeyInfo(process.env.SAML_METADATA_CERT_PATH
  || path.join(SAML_DIR, 'haka.crt'))

// eslint-disable-next-line max-len
const signaturePath = "/*/*[local-name(.)='Signature' and namespace-uri(.)='http://www.w3.org/2000/09/xmldsig#']"

const fetchIDPs = async () => {
  let metadata

  const metaFile = path.join(SAML_DIR, 'haka-meta.xml')
  try {
    const readMeta = fs.readFileSync(metaFile).toString()
    metadata = new DOMParser().parseFromString(readMeta, 'text/xml')
    const validUntil = Date.parse(metadata
      .getElementsByTagName('EntitiesDescriptor')[0]
      .getAttribute('validUntil'))
    if (validUntil < Date.now()) {
      throw new Error('metadata expired')
    }
    console.log('Found local cached identity provider metadata')
  } catch (err) {
    console.error(`Failed to load cached metadata: ${err}`)
    const response = await axios.get(METADATA_URL)
    const fetchedMeta = response.data
    metadata = new DOMParser().parseFromString(fetchedMeta, 'text/xml')
    const signature = xpath(metadata, signaturePath)[0]
    const checker = new SignedXml()
    checker.keyInfoProvider = IDP_METADATA_KEY
    checker.loadSignature(signature)
    if (!checker.checkSignature(fetchedMeta)) {
      throw new Error(checker.validationErrors)
    }
    fs.writeFileSync(metaFile, new XMLSerializer().serializeToString(metadata))
    console.log('Fetched and verified remote identity provider metadata')
  }
  return metadata
}

const metadata = fetchIDPs().then(
  idp => idp,
  err => console.error('Failed to load identity provider info:', err))

const idps = new Map()

const getIDP = async entityID => {
  if (!idps.has(entityID)) {
    const meta = await metadata
    const idpMetadata = Array.prototype.find.call(meta
      .getElementsByTagName('EntityDescriptor'),
    entity => Array.prototype.find.call(entity.attributes,
      attr => attr.name === 'entityID'
    ).value === entityID)
    idpMetadata.getElementsByTagName('IDPSSODescriptor')[0]
      .setAttribute('WantAuthnRequestsSigned', 'true')
    idps.set(entityID, samlify.IdentityProvider({
      metadata: new XMLSerializer().serializeToString(idpMetadata),
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
    }))
  }
  return idps.get(entityID)
}

export default getIDP
