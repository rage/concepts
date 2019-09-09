const { ForbiddenError } = require('apollo-server-core')

const { checkAccess, Role, Privilege, roleToInt } = require('../../accessControl')
const { nullShield } = require('../../errors')

const findPointGroups = async (workspaceId, courseId, context) => {
  if (roleToInt(context.role) === roleToInt(Role.STUDENT)) {
    const sourceCourseId = (await context.prisma.course({ id: courseId }).sourceCourse() || {}).id
    const pgData = await context.prisma.$graphql(`
      query($workspaceId: ID!, $userId: ID!, $courseId: ID!) {
        workspace(where: { id: $workspaceId }) {
          sourceTemplate {
            mainCourse {
              id
            }
            pointGroups(where: { course: { id: $courseId } }) {
              id
              name
              startDate
              endDate
              maxPoints
              pointsPerConcept
              course {
                id
              }
              completions(where: { user: { id: $userId } }) {
                id
                conceptAmount
              }
            }
          }
        }
      }
    `, { workspaceId, userId: context.user.id, courseId: sourceCourseId })
    if (!pgData || !pgData.workspace || !pgData.workspace.sourceTemplate
      || !pgData.workspace.sourceTemplate.pointGroups || !pgData.workspace.sourceTemplate.mainCourse
    ) {
      return null
    }
    const mainCourseId = pgData.workspace.sourceTemplate.mainCourse.id
    if (sourceCourseId !== mainCourseId) {
      return null
    }
    const currentTime = new Date().getTime()
    return pgData.workspace.sourceTemplate.pointGroups.filter(
      group => group.course.id === mainCourseId
        && new Date(group.startDate).getTime() <= currentTime
        && new Date(group.endDate).getTime() >= currentTime)
  }
}

const updatePointGroups = async (pointGroups, context) => {
  for (const group of pointGroups) {
    if (group.completions.length > 0) {
      const completion = group.completions[0]
      await context.prisma.updateCompletion({
        where: { id: completion.id },
        data: {
          conceptAmount: completion.conceptAmount + 1
        }
      })
    } else {
      await context.prisma.createCompletion({
        conceptAmount: 1,
        user: { connect: { id: context.user.id } },
        pointGroup: { connect: { id: group.id } }
      })
    }
  }
}

const ConceptMutations = {
  async createConcept(root, { name, description, official, courseId, workspaceId, tags }, context) {
    await checkAccess(context, {
      minimumRole: official ? Role.STAFF : Role.GUEST,
      minimumPrivilege: Privilege.EDIT,
      workspaceId
    })

    const belongsToTemplate = await context.prisma.workspace({ id: workspaceId }).asTemplate()

    const createdConcept = await context.prisma.createConcept({
      name,
      createdBy: { connect: { id: context.user.id } },
      workspace: { connect: { id: workspaceId } },
      description: description,
      official: Boolean(belongsToTemplate || official),
      courses: courseId ? { connect: [{ id: courseId }] } : undefined,
      tags: { create: tags }
    })

    if (createdConcept) {
      const pointGroups = await findPointGroups(workspaceId, courseId, context)
      if (pointGroups && pointGroups.length > 0) {
        await updatePointGroups(pointGroups, context)
      }
    }
    return createdConcept
  },

  async updateConcept(root, { id, name, description, official, tags, frozen }, context) {
    const { id: workspaceId } = nullShield(await context.prisma.concept({ id }).workspace())
    await checkAccess(context, {
      minimumRole: Role.GUEST,
      minimumPrivilege: Privilege.EDIT,
      workspaceId
    })

    const oldConcept = await context.prisma.concept({ id })

    if (oldConcept.frozen && frozen !== false)
      throw new ForbiddenError('This concept is frozen')
    if ((official !== undefined && official !== oldConcept.official)
        || (frozen || oldConcept.frozen)) {
      await checkAccess(context, {
        minimumRole: Role.STAFF,
        workspaceId
      })
    }

    const belongsToTemplate = await context.prisma.workspace({ id: workspaceId }).asTemplate()
    const oldTags = await context.prisma.concept({ id }).tags()

    const tagsToDelete = oldTags
      .filter(oldTag => !tags.find(tag => tag.id === oldTag.id))
      .map(oldTag => ({ id: oldTag.id }))
    const tagsToCreate = tags
      .filter(tag => !oldTags.find(oldTag => oldTag.id === tag.id))

    const data = {
      tags: {
        delete: tagsToDelete,
        create: tagsToCreate
      },
      official: Boolean(official),
      frozen: Boolean(frozen)
    }

    if (description !== undefined) data.description = description
    if (name !== undefined) {
      if (!belongsToTemplate && name !== oldConcept.name) data.official = false
      data.name = name
    }

    return await context.prisma.updateConcept({
      where: { id },
      data
    })
  },

  async deleteConcept(root, { id }, context) {
    const { id: workspaceId } = nullShield(await context.prisma.concept({ id }).workspace())
    await checkAccess(context, {
      minimumRole: Role.GUEST,
      minimumPrivilege: Privilege.EDIT,
      workspaceId
    })
    const toDelete = await context.prisma.concept({ id }).$fragment(`
      fragment ConceptWithCourse on Concept {
        id
        frozen
        courses {
          id
        }
      }
    `)
    if (toDelete.frozen) throw new ForbiddenError('This concept is frozen')
    await context.prisma.deleteConcept({ id })
    return {
      id: toDelete.id,
      courseId: toDelete.courses[0].id
    }
  }
}

module.exports = ConceptMutations
