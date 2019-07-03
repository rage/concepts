const { checkAccess } = require('../../accessControl')

/**
 * Returns false if there are missing obligatory fields
 * @param {json} data JSON to be validated
 */
const validateData= (data) => {
  // Validate workspace from json
  if (data['workspace'] === undefined && data['workspaceId'] === undefined) return false
  if (data['workspace'] !== undefined && data['workspaceId'] !== undefined) return false
  
  // Validate courses from json
  if (data['courses'] === undefined ||
      typeof data['courses'][Symbol.iterator] !== 'function') return false
  
  data['courses'].forEach(course => {
    if (course['name'] === undefined) return false
    if (course['concepts'] !== undefined &&
        typeof course['concepts'][Symbol.iterator] === 'function') {
      course['concepts'].forEach(concept => {
        if (concept.name === undefined) return false
        if (concept.description === undefined) return false
      })
    }
  })
  return true
}

const PortMutations = {
  async portData(root, args, context) {
    checkAccess(context, { allowStaff: true, allowStudent: true })
    let json

    try {
      json = JSON.parse(args.data)
      if (!validateData(json)) {
        throw new Error('Invalid data format')
      }
    } catch (err) {
      console.log('Error parsing JSON: ', err)
    }

    // Create or find workspace
    let workspace
    if (json['workspace'] !== undefined) {
      workspace = await context.prisma.createWorkspace({
        name: json['workspace'],
        owner: {
          connect: { id: context.user.id }
        }
      })
    } else if (json['workspaceId'] !== undefined) {
      workspace = await context.prisma.workspace({
        id: json['workspaceId']
      })
      if (workspace === null) {
        throw Error('No such workspace')
      }
    }

    // Save data to prisma
    let courses = json['courses']
    let result = await courses.map(async course => {
      let courseObj = await context.prisma.createCourse({
        name: course['name'],
        createdBy: { connect: { id: context.user.id }},
        workspace: { connect: { id: workspace.id }}
      })

      if (course['default'] !== undefined && course['default'] === true) {
        await context.prisma.updateWorkspace({
          where: {
            id: workspace.id
          },
          data: {
            defaultCourse: {
              connect: { id: courseObj.id }
            }
          }
        })
      }

      course['concepts'].forEach(async concept => {
        let conceptData = {
          name: concept['name'],
          description: concept['description'],
          createdBy: { connect: { id: context.user.id } },
          workspace: { connect: { id: workspace.id }},
          courses: { connect: [{ id: courseObj.id }] }
        }
        if (concept['official'] !== undefined) conceptData['official'] = concept['official']
        await context.prisma.createConcept(conceptData)
      })

      return courseObj
    })

    return result
  }
}

module.exports = PortMutations