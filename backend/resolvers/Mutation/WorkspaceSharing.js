const { checkAccess, Role, Privilege } = require('../../accessControl')

const WorkspaceSharingMutations = {
  async createWorkspaceToken(root, { workspaceId, privilege }, context) {
    await checkAccess(context, {
      minimumRole: Role.GUEST,
      minimumPrivilege: Privilege.OWNER,
      workspaceId
    })
    return await context.prisma.createWorkspaceToken({
      privilege,
      workspace: {
        connect: { id: workspaceId }
      },
      revoked: false
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
      user: {      connect: { id: userId } }
    })
  },
  async updateWorkspaceParticipant(root, { id, privilege }, context) {
    const { id: workspaceId } = await context.prisma.workspaceParticipant({ id }).workspace()
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
    const { id: workspaceId } = await context.prisma.workspaceParticipant({ id }).workspace()
    const { id: userId } = await context.prisma.workspaceParticipant({ id }).user()
    await checkAccess(context, {
      minimumRole: Role.GUEST,
      minimumPrivilege: userId === context.user.id ? Privilege.READ : Privilege.OWNER,
      workspaceId
    })
    return await context.prisma.deleteWorkspaceParticipant({
      id
    })
  },
  async joinWorkspace(root, { tokenId }, context) {
    await checkAccess(context, {
      minimumRole: Role.GUEST
    })
    const privilege = await context.prisma.workspaceToken({ id: tokenId }).privilege()
    const workspace = await context.prisma.workspaceToken({ id: tokenId }).workspace()
    return await context.prisma.createWorkspaceParticipant({
      privilege,
      workspace: { connect: { id: workspace.id    } },
      user:      { connect: { id: context.user.id } },
      token:     { connect: { id: tokenId    } }
    })
  }
}

module.exports = WorkspaceSharingMutations
