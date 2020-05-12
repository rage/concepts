To enable Haka authentication, this directory should contain:

* haka.crt from https://wiki.eduuni.fi/display/CSCHAKA/Haka+metadata
* metadata.xml with the metadata of the SAML Service Provider (SP) entity
* privatekey.pem and publickey.crt with the certs for the SP

It might theoretically work with other SAML federations too:

* The `haka.crt` path can be changed with the `SAML_METADATA_CERT_PATH` environment variable
* The path to download the metadata (that is validated with `haka.crt` can be changed with the `SAML_METADATA_URL` env var.
* The login response field names are hardcoded in [loginAPI.js](https://github.com/rage/concepts/blob/master/backend/src/controllers/loginAPI.js#L12-L15)
