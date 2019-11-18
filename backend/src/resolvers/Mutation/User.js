import { AuthenticationError } from 'apollo-server-core'

export const updateSeenGuides = async (root, { id, seenGuides }, context) => {
  if (context.user?.id !== id) {
    return new AuthenticationError('Must be logged in')
  }
  const user = await context.prisma.user({ id })
  const newSeenGuides = seenGuides?.filter(guide => !user.seenGuides.includes(guide))

  return await context.prisma.updateUser({
    where: { id },
    data: {
      seenGuides: { set: [...user.seenGuides, ...newSeenGuides] }
    }
  })
}
