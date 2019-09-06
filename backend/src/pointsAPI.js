const { userDetails } = require('./TMCAuthentication')
const { prisma } = require('../schema/generated/prisma-client')

const HEADER_PREFIX = 'Bearer '.toLowerCase()

const getTokenFrom = request => {
  const authorization = request.get('Authorization') || ''
  return authorization.toLowerCase().startsWith(HEADER_PREFIX)
    && authorization.substr(HEADER_PREFIX.length)
}

const convertPointGroup = ({ name, completions: [completion], maxPoints, pointsPerConcept }) => {
  const nPoints = Math.min(maxPoints, completion.conceptAmount * pointsPerConcept)

  return {
    group: name,
    progress: nPoints / maxPoints,
    /* eslint-disable camelcase */
    n_points: nPoints,
    max_points: maxPoints
    /* eslint-enable camelcase */
  }
}

const pointsAPI = async (req, res) => {
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
              user { tmcId }
            }
          }
        }
      }
    }
  `, { pid, cid, tmcId })
  return res.json(
    (data.project && data.project.activeTemplate && data.project.activeTemplate.pointGroups || [])
      .map(convertPointGroup))
}

module.exports = pointsAPI
