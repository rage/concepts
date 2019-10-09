/* eslint-env node */
const proxy = require('http-proxy-middleware')

const target = process.env.PROXY || require('../package.json').proxy
const prismaTarget = process.env.PRISMA_PROXY

module.exports = app => {
  app.use(proxy('/graphql', { target, changeOrigin: true, ws: true }))
  app.use(proxy('/playground', { target, changeOrigin: true }))
  if (prismaTarget) {
    app.use(proxy('/prisma', { target: prismaTarget, pathRewrite: { '^/prisma': '/' } }))
  }
}
