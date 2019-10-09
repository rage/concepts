import fs from 'fs'
import path from 'path'

import * as samlify from 'samlify'
import * as validator from '@authenio/samlify-node-xmllint'

const SAML_DIR = process.env.SAML_DIR || './saml'

samlify.setSchemaValidator(validator)

const sp = samlify.ServiceProvider({
  metadata: fs.readFileSync(path.join(SAML_DIR, 'metadata.xml')),
  encPrivateKey: fs.readFileSync(path.join(SAML_DIR, 'privatekey.pem')),
  privateKey: fs.readFileSync(path.join(SAML_DIR, 'privatekey.pem')),
  loginNameIDFormat: 'transient'
})

export default sp
