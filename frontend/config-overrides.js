/* eslint-env node */
const path = require('path')

const { addBabelPlugin, useBabelRc, babelInclude, override } = require('customize-cra')

module.exports = override(
  useBabelRc(),
  babelInclude([path.resolve('src'), path.resolve(__dirname, '../backend/src')]),
  // useBabelRc doesn't seem to work for the include
  addBabelPlugin('@babel/plugin-proposal-optional-chaining'),
)
