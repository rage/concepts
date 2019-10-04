import { checkAccess, Role, Privilege } from '../../util/accessControl'
import makeSecret from '../../util/secret'

const workspaceAllDataQuery = `
query($id : ID!) {
  project(where: {id: $id}) {
    activeTemplate {
      id
      name
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
        createdBy {
          id
        }
        concepts {
          id
          name
          description
          official
          frozen
          createdBy {
            id
          }
        }
      }
    }
  }
}
`

export const bloom = [{
  name: 'REMEMBER',
  type: 'bloom',
  priority: 0
}, {
  name: 'UNDERSTAND',
  type: 'bloom',
  priority: 100
}, {
  name: 'APPLY',
  type: 'bloom',
  priority: 200
}, {
  name: 'ANALYZE',
  type: 'bloom',
  priority: 300
}, {
  name: 'EVALUATE',
  type: 'bloom',
  priority: 400
}, {
  name: 'CREATE',
  type: 'bloom',
  priority: 500
}]

const WorkspaceMutations = {
  async createWorkspace(root, args, context) {
    await checkAccess(context, { minimumRole: Role.GUEST })
    return await context.prisma.createWorkspace({
      name: args.name,
      sourceProject: args.projectId !== undefined ? {
        connect: { id: args.projectId }
      } : null,
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
  },
  async deleteWorkspace(root, { id }, context) {
    const asTemplate = await context.prisma.workspace({ id }).asTemplate()
    if (asTemplate) {
      throw new Error('Cannot remove a template')
    }
    await checkAccess(context, {
      minimumRole: Role.GUEST,
      minimumPrivilege: Privilege.OWNER,
      workspaceId: id
    })
    return context.prisma.deleteWorkspace({ id })
  },
  async updateWorkspace(root, { id, name }, context) {
    await checkAccess(context, {
      minimumRole: Role.GUEST,
      minimumPrivilege: Privilege.EDIT,
      workspaceId: id
    })
    return context.prisma.updateWorkspace({
      where: { id },
      data: { name }
    })
  },
  async createTemplateWorkspace(root, { name, projectId }, context) {
    await checkAccess(context, { minimumRole: Role.STAFF })
    return await context.prisma.createWorkspace({
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
  },
  async deleteTemplateWorkspace(root, { id }, context) {
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
    return context.prisma.deleteWorkspace({ id })
  },
  async updateTemplateWorkspace(root, { id, name, active, courseId }, context) {
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
    return context.prisma.updateWorkspace(args)
  },
  async cloneTemplateWorkspace(root, { name, projectId }, context) {
    await checkAccess(context, { minimumRole: Role.GUEST })

    const result = await context.prisma.$graphql(workspaceAllDataQuery, {
      id: projectId
    })

    const workspaceId = makeSecret(25)
    const templateWorkspace = result.project.activeTemplate
    const makeNewId = (id) => id.substring(0, 13) + workspaceId.substring(13, 25)

    return await context.prisma.createWorkspace({
      id: workspaceId,
      name,
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
      courses: {
        create: templateWorkspace.courses.map(course => ({
          id: makeNewId(course.id),
          name: course.name,
          official: course.official,
          frozen: true,
          createdBy: { connect: { id: course.createdBy.id } },
          sourceCourse: { connect: { id: course.id } },
          concepts: {
            create: course.concepts.map(concept => ({
              id: makeNewId(concept.id),
              name: concept.name,
              description: concept.description,
              official: concept.official,
              frozen: true,
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
  }
}

export default WorkspaceMutations
