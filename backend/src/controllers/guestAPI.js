import { prisma } from '../../schema/generated/prisma-client'

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

const EXPIRATION_IN_DAYS = 200

/**
 * Check whether or not the token is expired
 * @param {String} lastSeenTime DateTime from prisma
 * @param {Date} today today time in millis
 * @param {int} duration duration of days
 */
const isExpired = (lastSeenTime, today) => {
  const time = new Date(lastSeenTime)
  const elapsedDays = (today.getTime() - time.getTime()) / 86400000
  return elapsedDays <= EXPIRATION_IN_DAYS
}

const deactivateGuest = async (id) => {
  try {
    await prisma.updateUser({ 
      where : { id },
      data: { deactivated: true }
    })
  } catch (e) {
    console.error(e)
  }
}

export const guestAPI = async (req, res) => {
  const { users } = await prisma.$graphql(guestQuery)
  const today = new Date()
  let message = { guestsDeactivated: 0 }

  for (let guest of users) {
    // Accounts without tokens are also to be removed.
    if (guest.tokens.length === 0) {
      deactivateGuest(guest.id)
      message.guestsDeactivated++
    }

    // Check for expired tokens
    for (let token of guest.tokens) {
      if (isExpired(token.lastSeenTime, today)) {
        deactivateGuest(guest.id)
        message.guestsDeactivated++
        break
      }
    }
  }
  

  return res.json(message)
}