const queries = require('./resolvers/Query')
const mutations = require('./resolvers/Mutation')

const ERROR_COLOR = '\x1b[31m'
const STRING_COLOR = '\x1b[32m'
const RESET_COLOR = '\x1b[0m'

/**
 * returns the type of path: 'mutation' or 'query'
 * @param {string} path Path variable in string format
 */
const getPathType = (path) => {
  if (Object.keys(queries).includes(path)) {
    return 'Query'
  } else if (Object.keys(mutations).includes(path)) {
    return 'Mutation'
  }
  return 'Type'
}

const logError = error => {
  const errorData = {
    message: error.message,
    now: new Date(Date.now()).toISOString()
      .replace(/T/, ' ')
      .replace(/\..+/, '')
  }

  // Convert path array into a string
  if (error.path) {
    errorData.path = error.path.reduce((first, second) => first + '/' + second)
    errorData.type = getPathType(errorData.path)
  }

  let errorMessage = errorData.now + ' --- '
  if (!error.path) {
    errorMessage += `Error: ${ERROR_COLOR}'${errorData.message}'${RESET_COLOR}`
  } else if (error.extensions) {
    errorData.code = error.extensions.code
    errorMessage += `Code: ${ERROR_COLOR}'${errorData.code}'${RESET_COLOR},` 
    errorMessage += `${errorData.type}: ${STRING_COLOR}'${errorData.path}'${RESET_COLOR},`
    errorMessage += ` Message: ${ERROR_COLOR}'${errorData.message}'${RESET_COLOR}`
  } else if (error.locations) {
    errorMessage += `${errorData.type}: ${STRING_COLOR}'${errorData.path}'${RESET_COLOR},`
    errorMessage += ` Message: ${ERROR_COLOR}'${errorData.message}'${RESET_COLOR}`
  }
  console.error(errorMessage)

  return error
}

module.exports = { logError }
