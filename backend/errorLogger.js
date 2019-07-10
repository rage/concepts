const queries = require('./resolvers/Query')
const mutations = require('./resolvers/Mutation')

/**
 * returns the type of path: 'mutation' or 'query'
 * @param {string} path Path variable in string format
 */
const getPathType = (path) => {
  const query = Object.keys(queries).find(fnc => {
    return fnc === path
  })

  if (typeof query !== 'undefined') {
    return 'Query'
  }

  const mutation = Object.keys(mutations).find(fnc => {
    return fnc === path
  })

  if (typeof mutation !== 'undefined') {
    return 'Mutation'
  }

  return 'Unknown'
}

const logError = error => {
  const errorData = {
    'message': error['message'],
    'path': error['path'].reduce((first, second) => first + '/' + second),
    'now': new Date(Date.now()).toISOString().replace(/T/, ' ').replace(/\..+/, '')
  }
  errorData['type'] = getPathType(errorData['path'])

  let errorMessage = errorData['now'] + ' --- '
  if (typeof error['extensions'] !== 'undefined') {
    errorData.code = error['extensions']['code']
    errorMessage += 'Code:\x1b[31m\'' + errorData['code'] + '\'\x1b[0m, '
    errorMessage += errorData['type'] + ': \x1b[32m' + errorData['path']
    errorMessage += '\x1b[0m, Message: \x1b[31m\'' + errorData['message'] + '\'\x1b[0m'
  } else if (typeof error['locations'] !== 'undefined') {
    errorMessage += errorData['type'] + ': \x1b[32m' + errorData['path']
    errorMessage += '\x1b[0m, Message: \x1b[31m\'' + errorData['message'] + '\'\x1b[0m'
  }
  console.error(errorMessage)

  return error
}

module.exports = { logError }
