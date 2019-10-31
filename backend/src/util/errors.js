import { ApolloError } from 'apollo-server-core'

export class NotFoundError extends ApolloError {
  constructor(type, id) {
    const idStr = id ? ` ${id}` : ''
    super(`${type.toTitleCase()}${idStr} not found`, 'NOT_FOUND', { type, id })

    Object.defineProperty(this, 'name', { value: 'NotFoundError' })
  }
}

export const nullShield = (value, type = 'workspace') => {
  if (!value) {
    throw new NotFoundError(type)
  }
  return value
}
