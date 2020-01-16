import { ForbiddenError } from 'apollo-server-core'

import { Role } from '../../util/permissions'

const deactivateInactiveGuests = `
mutation($maxDate: DateTime!) {
  updateManyUsers(where: {
    role: GUEST,
    deactivated: false,
    tokens_every: {
      lastSeenTime_lt: $maxDate
    }
  }, data: {
    deactivated: true
  }) {
    count
  }
}
`

const deleteWorkspaceParticipations = `
mutation {
  deleteManyWorkspaceParticipants(where: {
    user: { deactivated: true }
  }) {
    count
  }
}
`

const deleteAbandonedWorkspaces = `
mutation {
  deleteManyWorkspaces(where: {
    participants_none: {
      id_not: null
    }
  }) {
    count
  }
}
`

const EXPIRATION_IN_DAYS = 30

export const systemCleanup = async (root, args, { prisma, role }) => {
  if (role < Role.ADMIN) {
    throw new ForbiddenError('Access denied')
  }

  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate() + EXPIRATION_IN_DAYS)

  const { updateManyUsers } = await prisma.$graphql(deactivateInactiveGuests, { maxDate })
  const { deleteManyWorkspaceParticipants } = await prisma.$graphql(deleteWorkspaceParticipations)
  const { deleteManyWorkspaces } = await prisma.$graphql(deleteAbandonedWorkspaces)

  return {
    deactivatedCount: updateManyUsers.count,
    deletedParticipationCount: deleteManyWorkspaceParticipants.count,
    deletedWorkspaceCount: deleteManyWorkspaces.count
  }
}
