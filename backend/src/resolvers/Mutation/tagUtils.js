export const createMissingTags = async (tags, workspaceId, context, field) => {
  if (!tags) {
    return []
  }
  const tagsToCreate = tags.filter(tag => !tag.id)
  if (tagsToCreate.length > 0) {
    const createdTags = await Promise.all(tagsToCreate.map(tag => context.prisma.createTag(tag)))
    await context.prisma.updateWorkspace({
      where: { id: workspaceId },
      data: {
        [field]: { connect: createdTags.map(tag => ({ id: tag.id })) }
      }
    })
    return tags.filter(tag => !!tag.id).concat(createdTags).map(tag => ({ id: tag.id }))
  }
  return tags.map(tag => ({ id: tag.id }))
}

export const filterTags = async (tags, oldTags, workspaceId, context, createField) => {
  const disconnect = tags ? oldTags
    .filter(oldTag => !tags.find(tag => tag.id === oldTag.id))
    .map(oldTag => ({ id: oldTag.id })) : []
  const connect = tags ? await createMissingTags(
    tags.filter(tag => !oldTags.find(oldTag => oldTag.id === tag.id)),
    workspaceId, context, createField) : []
  return { connect, disconnect }
}
