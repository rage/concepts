import { ForbiddenError } from 'apollo-server-core'

import { Role } from '../../util/permissions'

const guestQuery = `
query {
  users (where: { 
    role: GUEST, 
    deactivated: false 
  }) {
    id
    role
    tokens {
      id 
      lastSeenTime
    } 
  }
}
`

const EXPIRATION_IN_DAYS = 30
const DAY = 24 * 60 * 60 * 1000

const isExpired = lastSeenTime => {
  const time = new Date(lastSeenTime)
  const elapsedDays = (Date.now() - time.getTime()) / DAY
  return elapsedDays >= EXPIRATION_IN_DAYS
}

const deactivateGuest = async (id, context) => {
  try {
    await context.prisma.updateUser({
      where: { id },
      data: { deactivated: true }
    })
    await context.prisma.deleteManyWorkspaceParticipants({
      user: { id }
    })
    await context.prisma.deleteManyProjectParticipants({
      user: { id }
    })
    return id
  } catch (e) {
    console.error('Error deactivating guest:', e)
    return false
  }
}

export const cleanGuests = async (root, args, context) => {
  if (context.role < Role.ADMIN) {
    throw new ForbiddenError('Access denied')
  }
  const { users } = await context.prisma.$graphql(guestQuery)

  const deactivations = await Promise.all(users
    .map(guest => guest.tokens.find(token =>
      !isExpired(token.lastSeenTime)) ? null : deactivateGuest(guest.id, context))
    .filter(promise => Boolean(promise)))

  return {
    deactivated: deactivations.filter(id => Boolean(id)),
    errors: deactivations.filter(id => !id).length
  }
}
