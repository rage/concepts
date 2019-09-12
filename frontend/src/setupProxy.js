/* eslint-env node */
const proxy = require('http-proxy-middleware')

const target = process.env.PROXY || require('../package.json').proxy

module.exports = app => app.use(proxy('/graphql', { target, changeOrigin: true }))
