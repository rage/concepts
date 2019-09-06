const { userDetails } = require('./TMCAuthentication')
const { prisma } = require('../schema/generated/prisma-client')

const getTokenFrom = (request) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

const pointsAPI = async (req, res) => {
  const { pid, cid } = req.params
  const token = getTokenFrom(req)
  if (!token) return res.status(401).send('Token missing')
  if (!pid || !cid) return res.status(401).send('Project or course id missing')
  let userData
  try {
    userData = await userDetails(token)
  } catch (e) {
    return res.status(401).send('Token invalid')
  }
  const tmcId = userData.id
  const data = await prisma.$graphql(`
    query($projectId: ID!,$courseId: ID!) {
      project(where: { id: $projectId }) {
        id
        activeTemplate {
          id
          pointGroups(where: {course: {id: $courseId} }) {
            id name
            maxPoints pointsPerConcept
            course { id }
          }
        }
      }
    }
  `,
  {
    projectId: pid,
    courseId: cid
  })
  const project = data.project
  const userProgress = []
  const pointGroups = (project && project.activeTemplate) && project.activeTemplate.pointGroups
  if (project && pointGroups) {
    for (const pointGroup of pointGroups) {
      console.log(pointGroup)
      const existingCompletions = await prisma.pointGroup({ id: pointGroup.id }).completions()
        .$fragment(`
      fragment CompletionWithUser on Completion {
        id
        conceptAmount
        user { tmcId }
      }
      `)
      const completionForUser = existingCompletions.find(completion =>
        completion.user.tmcId === tmcId)
      const userPoints = completionForUser.conceptAmount * pointGroup.pointsPerConcept
      const progress = pointGroup.maxPoints < userPoints ? 1.00 : pointGroup.maxPoints / userPoints
      const nPoints = pointGroup.maxPoints < userPoints ? pointGroup.maxPoints : userPoints

      /* eslint-disable camelcase */
      userProgress.push({
        group: pointGroup.name,
        progress,
        n_points: nPoints,
        max_points: pointGroup.maxPoints
      })
      /* eslint-enable camelcase */
    }
  }

  return res.json(userProgress)
}

module.exports = {
  pointsAPI
}
