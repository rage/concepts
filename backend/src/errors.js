const { ApolloError } = require('apollo-server-core')

class NotFoundError extends ApolloError {
  constructor(type) {
    super(`${type[0].toUpperCase()}${type.slice(1)} not found`, 'NOT_FOUND', { type })

    Object.defineProperty(this, 'name', { value: 'NotFoundError' })
  }
}

const nullShield = (value, type = 'workspace') => {
  if (!value) {
    throw new NotFoundError(type)
  }
  return value
}

module.exports = { NotFoundError, nullShield }
