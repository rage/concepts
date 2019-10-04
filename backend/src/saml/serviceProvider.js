import fs from 'fs'
import path from 'path'

import * as samlify from 'samlify'

const SAML_DIR = process.env.SAML_DIR || './saml'

// FIXME this is apparently insecure for some reason
samlify.setSchemaValidator({
  validate: async () => 'skipped'
})

const sp = samlify.ServiceProvider({
  metadata: fs.readFileSync(path.join(SAML_DIR, 'metadata.xml')),
  encPrivateKey: fs.readFileSync(path.join(SAML_DIR, 'privatekey.pem')),
  privateKey: fs.readFileSync(path.join(SAML_DIR, 'privatekey.pem')),
  loginNameIDFormat: 'transient'
})

export default sp
