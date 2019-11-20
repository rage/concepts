import { checkAccess, Role, Privilege } from '../../util/accessControl'

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

export const allProjects = async (root, args, context) => {
  await checkAccess(context, { minimumRole: Role.ADMIN })
  return await context.prisma.projects()
}

export const limitedProjectById = async (root, args, context) => {
  await checkAccess(context, {
    minimumRole: Role.GUEST,
    minimumPrivilege: Privilege.CLONE,
    projectId: args.id
  })
  const res = await context.prisma.$graphql(studentQuery, {
    id: args.id
  })
  return {
    id: res.project.id,
    name: res.project.name,
    activeTemplateId: res.project.activeTemplate.id
  }
}

export const projectById = async (root, args, context) => {
  await checkAccess(context, {
    minimumRole: Role.STAFF,
    minimumPrivilege: Privilege.VIEW,
    projectId: args.id
  })
  return await context.prisma.project({
    id: args.id
  })
}

export const projectsForUser = async (root, args, context) => {
  await checkAccess(context, { minimumRole: Role.STAFF })
  return await context.prisma.user({
    id: context.user.id
  }).projectParticipations()
}

export const projectMemberInfo = async (root, { id }, context) => {
  await checkAccess(context, { projectId: id, minimumPrivilege: Privilege.OWNER })
  const data = await context.prisma.project({ id }).$fragment(`
      fragment ProjectParticipants on Project {
        participants {
          id
          privilege
          token {
            id
            privilege
            revoked
          }
          user {
            id
            tmcId
            role
          }
        }
      }
    `)
  const participants = data.participants.map(pcp => ({
    participantId: pcp.id,
    privilege: pcp.privilege,
    token: pcp.token,
    ...pcp.user
  }))
  // TODO add name/email/username to participants
  return participants
}
