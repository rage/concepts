import { userDetails } from '../util/tmcAuthentication'
import { prisma } from '../../schema/generated/prisma-client'
import { getTokenFrom, verifyAndRespondRequest } from '../util/restAuth'

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
  if (!token) return res.status(401).json({ error: 'Authorization header missing or invalid' })
  else if (!pid) return res.status(401).json({ error: 'Project ID missing' })
  else if (!cid) return res.status(401).json({ error: 'Course ID missing' })
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
  const resp = verifyAndRespondRequest(req, res, 'EXPORT_POINTS')
  if (resp !== 'OK') return resp
  const { pid } = req.params

  const data = await prisma.$graphql(`
    query($pid: ID!) {
      project(where: { id: $pid }) {
        name
        activeTemplate {
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
        return `${group.name}\t${userId}\t${points}`
      })) || []
  res.set('Content-Disposition', `attachment; filename="${data.project.name} points.tsv"`)
  res.set('Content-Type', 'text/tab-separated-values')
  return res.send(points.join('\n'))
}
