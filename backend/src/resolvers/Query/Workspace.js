import { checkAccess, Role, Privilege } from '../../util/accessControl'

const workspaceBySourceTemplateQuery = `
query($id: ID!, $userId: ID!) {
  user(where: { id: $userId}) {
    workspaceParticipations(where: { workspace: { sourceTemplate: { id: $id }}}) {
      id
      workspace {
        id
        name
      }
    }
  }
}
`

export const allWorkspaces = async (root, args, context) => {
  await checkAccess(context, { minimumRole: Role.ADMIN })
  return await context.prisma.workspaces()
}
export const workspaceById = async (root, args, context) => {
  await checkAccess(context, {
    minimumRole: Role.GUEST,
    minimumPrivilege: Privilege.READ,
    workspaceId: args.id
  })
  return await context.prisma.workspace({
    id: args.id
  })
}
export const workspacesForUser = async (root, args, context) => {
  await checkAccess(context, { minimumRole: Role.GUEST })
  return await context.prisma.user({
    id: context.user.id
  }).workspaceParticipations()
}
export const workspaceBySourceTemplate = async (root, { sourceId }, context) => {
  await checkAccess(context, { minimumRole: Role.GUEST })
  const res = await context.prisma.$graphql(workspaceBySourceTemplateQuery, {
    id: sourceId, userId: context.user.id
  })
  return res.user.workspaceParticipations?.[0]?.workspace
}
export const workspaceMemberInfo = async (root, { id }, context) => {
  await checkAccess(context, { workspaceId: id, minimumPrivilege: Privilege.OWNER })
  const data = await context.prisma.workspace({ id }).$fragment(`
    fragment WorkspaceParticipants on Workspace {
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
