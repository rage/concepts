import { checkAccess, Role, Privilege } from '../../util/accessControl'
import { NotFoundError } from '../../util/errors'

const studentQuery = `
query($id: ID!) {
  project(where: { id: $id }) {
    id
    name
    activeTemplate {
      id
    }
  }
}
`

const statisticsQuery = `
query($id: ID!) {
  project(where: { id: $id }) {
    activeTemplate {
      id
      courses {
        id
        concepts {
          id
          name
          level
        }
      }
      conceptLinks {
        id
      }
      participants(where: { privilege: CLONE, user: { role: STUDENT } }) {
        id
      }
      pointGroups {
        maxPoints
        pointsPerConcept
        completions {
          conceptAmount
        }
      }
    }
    workspaces {
      id
      concepts {
        id
        level
      }
      conceptLinks {
        id
      }
      participants(where: { user: { role: STUDENT } }) {
        id
      }
    }
  }
}
`

export const allProjects = async (root, args, context) => {
  await checkAccess(context, { minimumRole: Role.ADMIN })
  return await context.prisma.projects()
}

export const limitedProjectById = async (root, args, context) => {
  await checkAccess(context, {
    minimumRole: Role.GUEST,
    minimumPrivilege: Privilege.CLONE,
    projectId: args.id
  })
  const res = await context.prisma.$graphql(studentQuery, {
    id: args.id
  })
  return {
    id: res.project.id,
    name: res.project.name,
    activeTemplateId: res.project.activeTemplate.id
  }
}

export const projectById = async (root, args, context) => {
  await checkAccess(context, {
    minimumRole: Role.STAFF,
    minimumPrivilege: Privilege.VIEW,
    projectId: args.id
  })
  return await context.prisma.project({
    id: args.id
  })
}

export const projectStatistics = async (root, args, context) => {
  await checkAccess(context, {
    minimumRole: Role.STAFF,
    minimumPrivilege: Privilege.VIEW,
    projectId: args.id
  })

  const res = await context.prisma.$graphql(statisticsQuery, {
    id: args.id
  })

  const { activeTemplate, workspaces } = res.project

  if (!activeTemplate) {
    throw new NotFoundError('No active template set.')
  }

  const existingConcepts = new Set(activeTemplate.courses
    .flatMap(course => course.concepts.map(concept => concept.id)))
  const existingLinks = new Set(activeTemplate.conceptLinks.map(link => link.id))
  const countedParticipants = new Set(activeTemplate.participants
    .map(participant => participant.id))
  const pointGroups = activeTemplate.pointGroups

  const statistics = {
    links: 0,
    concepts: 0,
    participants: countedParticipants.size,
    maxPoints: 0,
    completedPoints: 0,
    pointList: {}
  }

  for (const group of pointGroups) {
    statistics.maxPoints += group.maxPoints
    for (const completion of group.completions) {
      const points = Math.min(group.maxPoints, completion.conceptAmount * group.pointsPerConcept)
      statistics.completedPoints += points
      if (!(points in statistics.pointList)) {
        statistics.pointList[points] = 1
      } else {
        statistics.pointList[points]++
      }
    }
  }
  statistics.pointList = Object.entries(statistics.pointList)
    .map(([value, amount]) => ({ value, amount }))
  for (const workspace of workspaces) {
    for (const concept of workspace.concepts) {
      if (!existingConcepts.has(concept.id)) {
        statistics.concepts++
      }
    }
    for (const link of workspace.conceptLinks) {
      if (!existingLinks.has(link.id)) {
        statistics.links++
      }
    }
    for (const participant of workspace.participants) {
      if (!countedParticipants.has(participant.id)) {
        statistics.participants++
        countedParticipants.add(participant.id)
      }
    }
  }

  return statistics
}

export const projectsForUser = async (root, args, context) => {
  await checkAccess(context, { minimumRole: Role.STAFF })
  return await context.prisma.user({
    id: context.user.id
  }).projectParticipations()
}

export const projectMemberInfo = async (root, { id }, context) => {
  await checkAccess(context, { projectId: id, minimumPrivilege: Privilege.OWNER })
  const data = await context.prisma.project({ id }).$fragment(`
      fragment ProjectParticipants on Project {
        participants {
          id
          privilege
          token {
            id
            privilege
            revoked
          }
          user {
            id
            tmcId
            role
          }
        }
      }
    `)
  const participants = data.participants.map(pcp => ({
    participantId: pcp.id,
    privilege: pcp.privilege,
    token: pcp.token,
    ...pcp.user
  }))
  // TODO add name/email/username to participants
  return participants
}
