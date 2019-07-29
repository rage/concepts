const { checkAccess, Role, Privilege } = require('../../accessControl')

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

const ProjectQueries = {
  async allProjects(root, args, context) {
    await checkAccess(context, { minimumRole: Role.STAFF })
    return await context.prisma.projects()
  },
  async workspaceBySourceTemplate(root, { workspaceId }, context) {
    await checkAccess(context, { minimumRole: Role.STUDENT})
    const workspace = context.prisma.workspace({
      sourceTemplate: { id: workspaceId }
    }).participants({ user: {id: context.user.id } })

    if (typeof workspace === 'undefined') {
      return null;
    }

    return workspace
  },
  async projectById(root, args, context) {
    if (context.role === Role.GUEST) {
      await checkAccess(context, {
        minimumRole: Role.GUEST,
        minimumPrivilege: Privilege.CLONE,
        projectId: args.id
      })
      const res = await context.prisma.$graphql(studentQuery, {
        id: args.id
      })
      return res.project
    } else {
      await checkAccess(context, {
        minimumRole: Role.STAFF,
        minimumPrivilege: Privilege.READ,
        projectId: args.id
      })
      return await context.prisma.project({
        id: args.id
      })
    }
  },
  async projectsForUser(root, args, context) {
    await checkAccess(context, { minimumRole: Role.STAFF })
    return await context.prisma.user({
      id: context.user.id
    }).projectParticipations()
  }
}

module.exports = ProjectQueries