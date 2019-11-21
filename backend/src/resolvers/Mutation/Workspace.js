import { checkAccess, Role, Privilege } from '../../util/accessControl'
import makeSecret from '../../util/secret'
import bloom from '../../static/bloom'
import { pubsub } from '../Subscription/config'
import {
  WORKSPACE_UPDATED, WORKSPACE_DELETED, PROJECT_WORKSPACE_CREATED
} from '../Subscription/config/channels'

const workspaceAllDataQuery = `
query($id : ID!) {
  project(where: {id: $id}) {
    activeTemplate {
      id
      name
      courseOrder
      conceptLinks {
        official
        frozen
        createdBy {
          id
        }
        from {
          id
        }
        to {
          id
        }
      }
      courseTags {
        id
        name
        type
        priority
      }
      conceptTags {
        id
        name
        type
        priority
      }
      courseLinks {
        official
        frozen
        createdBy {
          id
        }
        from {
          id
        }
        to {
          id
        }
      }
      courses {
        id
        name
        official
        frozen
        tags {
          id
        }
        createdBy {
          id
        }
        conceptOrder
        concepts {
          id
          name
          description
          official
          frozen
          tags {
            id
          }
          createdBy {
            id
          }
        }
      }
    }
  }
}
`

export const createWorkspace = async (root, { name }, context) => {
  await checkAccess(context, { minimumRole: Role.GUEST })
  return await context.prisma.createWorkspace({
    name: name,
    participants: {
      create: [{
        privilege: Privilege.OWNER.toString(),
        user: {
          connect: { id: context.user.id }
        }
      }]
    },
    conceptTags: {
      create: bloom
    }
  })
}

export const deleteWorkspace = async (root, { id }, context) => {
  const asTemplate = await context.prisma.workspace({ id }).asTemplate()
  if (asTemplate) {
    throw new Error('Cannot remove a template')
  }
  await checkAccess(context, {
    minimumRole: Role.GUEST,
    minimumPrivilege: Privilege.OWNER,
    workspaceId: id
  })
  const deletedWorkspace = context.prisma.deleteWorkspace({ id })
  pubsub.publish(WORKSPACE_DELETED, {
    workspaceDeleted: { workspaceId: id, ...deletedWorkspace }
  })
  return deletedWorkspace
}

export const updateWorkspace = async (root, { id, name, courseOrder }, context) => {
  await checkAccess(context, {
    minimumRole: Role.GUEST,
    minimumPrivilege: Privilege.EDIT,
    workspaceId: id
  })
  const data = {}
  if (name !== undefined) {
    data.name = name
  }
  if (courseOrder !== undefined) {
    data.courseOrder = {
      set: courseOrder
    }
  }
  const result = context.prisma.updateWorkspace({
    where: { id },
    data
  })
  pubsub.publish(WORKSPACE_UPDATED, { workspaceUpdated: { workspaceId: id, ...result } })
  return result
}

export const createTemplateWorkspace = async (root, { name, projectId }, context) => {
  await checkAccess(context, { minimumRole: Role.STAFF })
  const createdTemplateWorkspace = await context.prisma.createWorkspace({
    name,
    asTemplate: {
      connect: { id: projectId }
    },
    conceptTags: {
      create: bloom
    },
    participants: {
      create: [{
        privilege: Privilege.OWNER.toString(),
        user: {
          connect: { id: context.user.id }
        }
      }]
    }
  })
  pubsub.publish(PROJECT_WORKSPACE_CREATED, {
    projectWorkspaceCreated: { pId: projectId, ...createdTemplateWorkspace }
  })
  return createdTemplateWorkspace
}

export const deleteTemplateWorkspace = async (root, { id }, context) => {
  const activeTemplate = await context.prisma.workspace({
    id
  }).asTemplate().activeTemplate()
  if (activeTemplate?.id === id) {
    throw new Error('Active template cannot be removed.')
  }
  await checkAccess(context, {
    minimumRole: Role.STAFF,
    minimumPrivilege: Privilege.OWNER,
    workspaceId: id
  })
  const project = await context.prisma.workspace({
    id
  }).asTemplate()
  const deletedTemplateWorkspace = await context.prisma.deleteWorkspace({ id })
  pubsub.publish(WORKSPACE_DELETED, {
    workspaceDeleted: { pId: project.id, ...deletedTemplateWorkspace }
  })
  return deletedTemplateWorkspace
}

export const updateTemplateWorkspace = async (root, { id, name, active, courseId }, context) => {
  await checkAccess(context, {
    minimumRole: Role.STAFF,
    minimumPrivilege: Privilege.EDIT,
    workspaceId: id
  })
  const project = await context.prisma.workspace({
    id
  }).asTemplate()
  if (active) {
    await context.prisma.updateProject({
      where: { id: project.id },
      data: {
        activeTemplate: {
          connect: {
            id
          }
        }
      }
    })
  }
  const args = {
    where: { id },
    data: { name }
  }
  if (courseId === null) {
    args.data.mainCourse = { disconnect: true }
  } else if (courseId !== undefined) {
    args.data.mainCourse = { connect: { id: courseId } }
  }
  const updatedTemplateWorkspace = await context.prisma.updateWorkspace(args)
  pubsub.publish(WORKSPACE_UPDATED, {
    workspaceUpdated: { pId: project.id, ...updatedTemplateWorkspace }
  })
  return updatedTemplateWorkspace
}

export const cloneTemplateWorkspace = async (root, { name, projectId }, context) => {
  await checkAccess(context, { minimumRole: Role.GUEST })

  const result = await context.prisma.$graphql(workspaceAllDataQuery, {
    id: projectId
  })

  const workspaceId = makeSecret(25)
  const templateWorkspace = result.project.activeTemplate
  const makeNewId = (id) => id.substring(0, 13) + workspaceId.substring(13, 25)
  const isAutomaticSorting = conceptOrder => conceptOrder.length === 1
    && conceptOrder[0].startsWith('__ORDER_BY__')

  await Promise.all(templateWorkspace.conceptTags.concat(templateWorkspace.courseTags)
    .map(tag => context.prisma.createTag({
      ...tag,
      id: makeNewId(tag.id)
    })))

  const newClonedWorkspace = await context.prisma.createWorkspace({
    id: workspaceId,
    name,
    courseOrder: {
      set: templateWorkspace.courseOrder.map(makeNewId)
    },
    sourceProject: {
      connect: { id: projectId }
    },
    sourceTemplate: {
      connect: { id: templateWorkspace.id }
    },
    participants: {
      create: [{
        privilege: Privilege.OWNER.toString(),
        user: {
          connect: { id: context.user.id }
        }
      }]
    },
    courseTags: {
      connect: templateWorkspace.courseTags.map(tag => ({
        id: makeNewId(tag.id)
      }))
    },
    conceptTags: {
      connect: templateWorkspace.conceptTags.map(tag => ({
        id: makeNewId(tag.id)
      }))
    },
    courses: {
      create: templateWorkspace.courses.map(course => ({
        id: makeNewId(course.id),
        name: course.name,
        official: course.official,
        frozen: true,
        createdBy: { connect: { id: course.createdBy.id } },
        sourceCourse: { connect: { id: course.id } },
        tags: { connect: course.tags.map(tag => ({ id: makeNewId(tag.id) })) },
        conceptOrder:
          isAutomaticSorting(course.conceptOrder)
            ? { set: course.conceptOrder }
            : { set: course.conceptOrder.map(makeNewId) },
        concepts: {
          create: course.concepts.map(concept => ({
            id: makeNewId(concept.id),
            name: concept.name,
            description: concept.description,
            official: concept.official,
            frozen: true,
            tags: { connect: concept.tags.map(tag => ({ id: makeNewId(tag.id) })) },
            createdBy: { connect: { id: concept.createdBy.id } },
            workspace: { connect: { id: workspaceId } },
            sourceConcept: { connect: { id: concept.id } }
          }))
        }
      }))
    },
    conceptLinks: {
      create: templateWorkspace.conceptLinks.map(link => ({
        official: link.official,
        createdBy: { connect: { id: link.createdBy.id } },
        frozen: link.frozen,
        weight: link.weight,
        count: link.count,
        from: { connect: { id: makeNewId(link.from.id) } },
        to: { connect: { id: makeNewId(link.to.id) } }
      }))
    },
    courseLinks: {
      create: templateWorkspace.courseLinks.map(link => ({
        official: link.official,
        createdBy: { connect: { id: link.createdBy.id } },
        frozen: link.frozen,
        weight: link.weight,
        count: link.count,
        from: { connect: { id: makeNewId(link.from.id) } },
        to: { connect: { id: makeNewId(link.to.id) } }
      }))
    }
  })
  pubsub.publish(PROJECT_WORKSPACE_CREATED, {
    projectWorkspaceCreated: { pId: projectId, ...newClonedWorkspace }
  })
  return newClonedWorkspace
}
