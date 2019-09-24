/* eslint-env node */
const path = require('path')

const { useBabelRc, babelInclude, override } = require('customize-cra')

module.exports = override(
  useBabelRc(),
  babelInclude([path.resolve('src'), path.resolve(__dirname, '../backend/src')]),
)
