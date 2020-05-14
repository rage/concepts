To enable Haka authentication, this directory should contain:

* haka.crt from https://wiki.eduuni.fi/display/CSCHAKA/Haka+metadata
* metadata.xml with the metadata of the SAML Service Provider (SP) entity
* privatekey.pem and publickey.crt with the certs for the SP

Additionally, you need to set `SAML_METADATA_URL` to https://haka.funet.fi/metadata/haka-metadata.xml and
`HAKA_LOGIN_URL` to something like `https://haka.funet.fi/shibboleth/WAYF?entityID=<YOUR ENTITY ID>&return=<YOUR CONCEPTS INSTANCE>/api/login`.

It might theoretically work with other SAML federations too:

* The two environment variables mentioned above need to be changed accordingly.
* The `haka.crt` file path can be changed with the `SAML_METADATA_CERT_PATH` environment variable
* The login response field names are hardcoded in [loginAPI.js](https://github.com/rage/concepts/blob/master/backend/src/controllers/loginAPI.js#L12-L15)
