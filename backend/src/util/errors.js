const { ApolloError } = require('apollo-server-core')

class NotFoundError extends ApolloError {
  constructor(type, id) {
    const idStr = id ? ` ${id}` : ''
    super(`${type.toTitleCase()}${idStr} not found`, 'NOT_FOUND', { type, id })

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
