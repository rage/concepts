/* eslint-env node */
const path = require('path')
const fs = require('fs')

function rewriteImport(imp, file) {
  if (!imp.startsWith('.')) {
    return imp
  }
  const imported = path.join(path.dirname(file), imp)
  try {
    if (fs.lstatSync(imported).isDirectory()) {
      return `${imp}/index.js`
    }
  } catch (err) {}
  try {
    const file = fs.lstatSync(`${imported}.js`)
    if (file.isFile() || file.isSymbolicLink()) {
      return `${imp}.js`
    }
  } catch (err) {}
  try {
    const file = fs.lstatSync(`${imported}.json`)
    if (file.isFile() || file.isSymbolicLink()) {
      return `${imp}.js`
    }
  } catch (err) {}
  throw new Error(`Failed to resolve ${imp} from ${file}`)
}

module.exports = function indexImportBabelTransform({ types: t }) {
  return {
    visitor: {
      CallExpression(path, { filename }) {
        if (path.node.callee.type !== 'Import') {
          return
        }

        const [source] = path.get('arguments')
        if (source.type !== 'StringLiteral') {
          /* Should never happen */
          return
        }

        source.replaceWith(
          t.stringLiteral(rewriteImport(source.node.value, filename)),
        )
      },
      'ImportDeclaration|ExportNamedDeclaration|ExportAllDeclaration'(path, { filename }) {
        const source = path.get('source')

        // An export without a 'from' clause
        if (!source.node) {
          return
        }

        source.replaceWith(
          t.stringLiteral(rewriteImport(source.node.value, filename)),
        )
      }
    }
  }
}
