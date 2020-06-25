import { AuthenticationError, ForbiddenError } from 'apollo-server-core'
import jwt from 'jsonwebtoken'

const HEADER_PREFIX = 'Bearer '.toLowerCase()

export const getTokenFrom = request => {
  const authorization = request.get('Authorization') || ''
  return authorization.toLowerCase().startsWith(HEADER_PREFIX)
    ? authorization.substr(HEADER_PREFIX.length) : request.query.access_token
}

const typeMap = {
  EXPORT_POINTS: {
    idKey: 'pid',
    tokenIdKey: 'projectId',
    action: 'export point data',
    container: 'project'
  },
  EXPORT_WORKSPACE: {
    idKey: 'wid',
    tokenIdKey: 'workspaceId',
    action: 'export workspace',
    container: 'workspace'
  },
  EXPORT_MARKDOWN: {
    idKey: 'wid',
    tokenIdKey: 'workspaceId',
    action: 'export markdown',
    container: 'workspace'
  }
}

export const verifyRequest = (req, type) => {
  const typeData = typeMap[type]
  const { [typeData.idKey]: id } = req.params
  const token = getTokenFrom(req)
  if (!token) {
    throw new AuthenticationError('Authorization header missing or invalid')
  }

  let tokenData
  try {
    tokenData = jwt.verify(token, process.env.SECRET)
  } catch (e) {
    console.log(e)
    throw new AuthenticationError('Bad token')
  }
  if (tokenData.type !== type) {
    throw new ForbiddenError(`Token does not have access to ${typeData.action}`)
  } else if (tokenData[typeData.tokenIdKey] !== id) {
    throw new ForbiddenError(`Token does not have access to given ${typeData.container}`)
  } else if (new Date(tokenData.expiry).getTime() <= new Date().getTime()) {
    throw new ForbiddenError('Token has expired')
  }
  return tokenData
}

export const verifyAndRespondRequest = (req, res, type) => {
  try {
    verifyRequest(req, type)
  } catch (err) {
    if (err instanceof AuthenticationError) return res.status(401).json({ error: err.message })
    else if (err instanceof ForbiddenError) return res.status(403).json({ error: err.message })
    else {
      console.error('Error verifying points API request:', err)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
  return 'OK'
}
