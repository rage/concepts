const { checkAccess, Role, Privilege } = require('../../accessControl')
const { nullWrap } = require('../../errors')
const makeSecret = require('../../secret')

const workspaceAllDataQuery = `
query($id : ID!) {
  project(where: {id: $id}) {
    activeTemplate {
      id
      name
      conceptLinks {
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
        createdBy {
          id
        }
        concepts {
          id
          name
          description
          createdBy {
            id
          }
        }
      }
    }
  }
}
`

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
          privilege: 'OWNER',
          user: {
            connect: { id: context.user.id }
          }
        }]
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
      participants: {
        create: [{
          privilege: 'OWNER',
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
    if (activeTemplate && activeTemplate.id === id) {
      throw new Error('Active template cannot be removed.')
    }
    await checkAccess(context, {
      minimumRole: Role.STAFF,
      minimumPrivilege: Privilege.OWNER,
      workspaceId: id
    })
    return context.prisma.deleteWorkspace({ id })
  },
  async updateTemplateWorkspace(root, { id, name, active }, context) {
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
    return context.prisma.updateWorkspace({
      where: { id },
      data: { name }
    })
  },

  async createWorkspaceParticipant(root, { workspaceId, privilege, userId }, context) {
    await checkAccess(context, {
      minimumRole: Role.GUEST,
      minimumPrivilege: Privilege.OWNER,
      workspaceId
    })
    return await context.prisma.createWorkspaceParticipant({
      privilege,
      workspace: { connect: { id: workspaceId } },
      user: { connect: { id: userId } }
    })
  },
  async updateWorkspaceParticipant(root, { id, privilege }, context) {
    const { id: workspaceId } = nullWrap(
      await context.prisma.workspaceParticipant({ id }).workspace())
    await checkAccess(context, {
      minimumRole: Role.GUEST,
      minimumPrivilege: Privilege.OWNER,
      workspaceId
    })
    return await context.prisma.updateWorkspaceParticipant({
      where: { id },
      data: { privilege }
    })
  },
  async deleteWorkspaceParticipant(root, { id }, context) {
    const { id: workspaceId } = nullWrap(
      await context.prisma.workspaceParticipant({ id }).workspace())
    const { id: userId } = nullWrap(
      await context.prisma.workspaceParticipant({ id }).user(), 'user')
    await checkAccess(context, {
      minimumRole: Role.GUEST,
      minimumPrivilege: userId === context.user.id ? Privilege.READ : Privilege.OWNER,
      workspaceId
    })
    return await context.prisma.deleteWorkspaceParticipant({
      id
    })
  },
  async cloneTemplateWorkspace(root, { name, projectId }, context) {
    await checkAccess(context, { minimumRole: Role.GUEST })

    const result = await context.prisma.$graphql(workspaceAllDataQuery, {
      id: projectId
    })

    const workspaceId = makeSecret(25)
    const templateWorkspace = result.project.activeTemplate
    const makeNewId = (id) => id.substring(0, 13) + workspaceId.substring(13, 25)

    const createdWorkspace = await context.prisma.createWorkspace({
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
          privilege: 'OWNER',
          user: {
            connect: { id: context.user.id }
          }
        }]
      },
      courses: {
        create: templateWorkspace.courses.map(course => ({
          id: makeNewId(course.id),
          name: course.name,
          createdBy: { connect: { id: course.createdBy.id } },
          concepts: {
            create: course.concepts.map(concept => ({
              id: makeNewId(concept.id),
              name: concept.name,
              description: concept.description,
              createdBy: { connect: { id: concept.createdBy.id } },
              workspace: { connect: { id: workspaceId } }
            }))
          }
        }))
      },
      conceptLinks: {
        create: templateWorkspace.conceptLinks.map(link => ({
          createdBy: { connect: { id: link.createdBy.id } },
          from: { connect: { id: makeNewId(link.from.id) } },
          to: { connect: { id: makeNewId(link.to.id) } }
        }))
      },
      courseLinks: {
        create: templateWorkspace.courseLinks.map(link => ({
          createdBy: { connect: { id: link.createdBy.id } },
          from: { connect: { id: makeNewId(link.from.id) } },
          to: { connect: { id: makeNewId(link.to.id) } }
        }))
      }
    })

    return createdWorkspace
  }
}

module.exports = WorkspaceMutations
