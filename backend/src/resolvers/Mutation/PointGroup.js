const { checkAccess, Role, Privilege } = require('../../accessControl')
const { nullShield } = require('../../errors')

const checkScalars = (startDate, endDate, maxPoints,
  pointsPerConcept) => {
  const startDateObj = new Date(startDate)
  const endDateObj = new Date(endDate)

  if (startDate && endDate && startDateObj.getTime() > endDateObj.getTime()) {
    throw new Error('End date cannot be before start date.')
  } else if (maxPoints !== undefined && maxPoints < 0) {
    throw new Error('Max points cannot be negative.')
  } else if (pointsPerConcept !== undefined && pointsPerConcept < 0) {
    throw new Error('Points per concept cannot be negative.')
  }
}

const PointGroupMutations = {
  async createPointGroup(root, {
    name, startDate, endDate, maxPoints,
    pointsPerConcept, courseId, workspaceId
  }, context) {
    await checkAccess(context, {
      minimumRole: Role.STAFF,
      minimumPrivilege: Privilege.EDIT,
      workspaceId
    })

    checkScalars(startDate, endDate, maxPoints,
      pointsPerConcept)

    return await context.prisma.createPointGroup({
      name,
      startDate,
      endDate,
      maxPoints,
      pointsPerConcept,
      workspace: { connect: { id: workspaceId } },
      course: { connect: { id: courseId } }
    })
  },

  async updatePointGroup(root, {
    id, name, startDate, endDate, maxPoints,
    pointsPerConcept
  }, context) {
    const { id: workspaceId } = nullShield(await context.prisma.pointGroup({ id }).workspace())
    await checkAccess(context, {
      minimumRole: Role.STAFF,
      minimumPrivilege: Privilege.EDIT,
      workspaceId
    })

    checkScalars(startDate, endDate, maxPoints,
      pointsPerConcept)

    const data = {
      name,
      startDate,
      endDate,
      maxPoints,
      pointsPerConcept
    }

    return await context.prisma.updatePointGroup({
      data,
      where: { id }
    })
  },

  async deletePointGroup(root, { id }, context) {
    const { id: workspaceId } = nullShield(await context.prisma.pointGroup({ id }).workspace())
    await checkAccess(context, {
      minimumRole: Role.GUEST,
      minimumPrivilege: Privilege.EDIT,
      workspaceId
    })
    return await context.prisma.deletePointGroup({ id })
  }
}

module.exports = PointGroupMutations
