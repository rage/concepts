import { userDetails } from '../util/tmcAuthentication'
import { prisma } from '../../schema/generated/prisma-client'
import { getUser } from '../middleware/authentication'
import { Role } from '../util/permissions'

const HEADER_PREFIX = 'Bearer '.toLowerCase()

const getTokenFrom = request => {
  const authorization = request.get('Authorization') || ''
  return authorization.toLowerCase().startsWith(HEADER_PREFIX)
    && authorization.substr(HEADER_PREFIX.length)
}

const convertPointGroup = ({ name, completions: [completion], maxPoints, pointsPerConcept }) => {
  const nPoints = Math.min(maxPoints, (completion?.conceptAmount || 0) * pointsPerConcept)

  return {
    group: name,
    progress: nPoints / maxPoints,
    /* eslint-disable camelcase */
    n_points: nPoints,
    max_points: maxPoints
    /* eslint-enable camelcase */
  }
}

export const progressAPI = async (req, res) => {
  const { pid, cid } = req.params
  const token = getTokenFrom(req)
  let tmcId
  if (!token) return res.status(401).send({ error: 'Authorization header missing or invalid' })
  else if (!pid) return res.status(401).send({ error: 'Project ID missing' })
  else if (!cid) return res.status(401).send({ error: 'Course ID missing' })
  try {
    tmcId = (await userDetails(token)).id
  } catch (e) {
    return res.status(401).json({ error: 'Token invalid' })
  }
  const data = await prisma.$graphql(`
    query($pid: ID!, $cid: ID!, $tmcId: Int!) {
      project(where: { id: $pid }) {
        activeTemplate {
          pointGroups(where: { course: { id: $cid } }) {
            name
            maxPoints
            pointsPerConcept
            completions(where: { user: { tmcId: $tmcId } }) {
              conceptAmount
            }
          }
        }
      }
    }
  `, { pid, cid, tmcId })
  return res.json(data.project?.activeTemplate?.pointGroups?.map(convertPointGroup) || [])
}

export const pointsAPI = async (req, res) => {
  const { pid } = req.params
  const token = getTokenFrom(req)
  if (!token) return res.status(401).send({ error: 'Authorization header missing or invalid' })

  const context = {}
  await getUser(token, context, prisma)

  if (context.user.role < Role.STAFF) {
    return res.status(401).send({ error: 'Insufficient privileges' })
  }

  const data = await prisma.$graphql(`
    query($pid: ID!) {
      project(where: { id: $pid }) {
        activeTemplate {
          name
          pointGroups {
            name
            maxPoints
            pointsPerConcept
            completions {
              conceptAmount
              user {
                id
                tmcId
              }
            }
          }
        }
      }
    }
  `, { pid })
  const points = data.project?.activeTemplate?.pointGroups
    ?.flatMap(group => group.completions
      .map(completion => {
        const { n_points: points } = convertPointGroup({
          ...group,
          completions: [completion]
        })
        const userId = completion.user.tmcId || completion.user.id
        return `${group.name},${userId},${points}`
      })) || []
  res.set('Content-Type', 'text/csv')
  return res.send(points.join('\n'))
}
