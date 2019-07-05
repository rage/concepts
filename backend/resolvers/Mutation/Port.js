const { checkAccess } = require('../../accessControl')

/**
 * Returns false if there are missing obligatory fields
 * @param {json} data JSON to be validated
 */
const validateData = (data) => {
  // Validate workspace from json
  if (typeof data['workspace'] === 'string' && typeof data['workspaceId'] === 'string') {
    throw new Error('workspace and workspaceId cannot be at the same time')
  }
  if (typeof data['workspace'] !== 'string' && typeof data['workspaceId'] !== 'string') {
    throw new Error('workspace or workspaceId not found')
  }

  // Validate courses from json
  if (!Array.isArray(data['courses'])) {
    throw new Error('courses not found or is not an array')
  }

  for (const course of data['courses']) {
    if (typeof course['name'] !== 'string') {
      throw new Error('course name missing')

    }
    if (!Array.isArray(course['concepts'])) {
      throw new Error('concepts not found or is not an array')
    }
    if (typeof course['prerequisites'] !== 'undefined' && Arrays.isArray(course['prerequisites'])) {
      throw new Error('courses prerequisites was not an array')
    } else {
      for (const prerequisiteCourse of course['prerequisites']) {
        if (typeof prerequisiteCourse['name'] !== 'string') {
          throw new Error('prerequisite course name missing')
        }
        if (typeof prerequisiteCourse['official'] !== 'undefined' && typeof prerequisiteCourse['official'] !== 'boolean') {
          throw new Error('prerequisite course official field was not a boolean')
        }
      }
    }
    for (const concept of course['concepts']) {
      if (typeof concept.name !== 'string') {
        throw new Error('concept name missing')
      }
      if (typeof concept.description !== 'string') {
        throw new Error('concept description missing')
      }
      if (typeof concept.prerequisites !== 'undefined' || Arrays.isArray(concept.prerequisites)) {
        throw new Error('concept prequisites was not an array')
      } else {
        for (const prerequisiteConcept of concept.prerequisites) {
          if (typeof prerequisiteConcept.name !== 'string') {
            throw new Error('prerequisite concept name is missing')
          }
          if (typeof prerequisiteConcept.official !== 'undefined' && typeof prerequisiteConcept.official !== 'boolean') {
            throw new Error('prerequisite concept official field was not a boolean')
          }
          if (typeof prerequisiteConcept.course !== 'undefined' && typeof prerequisiteConcept.course !== 'string') {
            throw new Error('prerequisite concept course field was not a string')
          }
        }
      }
      

    }
  }
  return true
}

const PortMutations = {
  async portData(root, args, context) {
    checkAccess(context, { allowStaff: true, allowStudent: true })
    let json

    try {
      json = JSON.parse(args.data)
      validateData(json)
    } catch (err) {
      console.log('Error parsing JSON: ', err)
    }

    // Create or find workspace
    let workspace
    if (typeof json['workspace'] === 'string') {
      workspace = await context.prisma.createWorkspace({
        name: json['workspace'],
        owner: {
          connect: { id: context.user.id }
        }
      })
    } else if (typeof json['workspaceId'] === 'string') {
      workspace = await context.prisma.workspace({
        id: json['workspaceId']
      })
      if (workspace === null) {
        throw Error('No such workspace')
      }
    }

    // Save data to prisma
    let courses = json['courses']

    let courseData = await Promise.all(courses.map(async course => {
      let courseObj = await context.prisma.createCourse({
        name: course['name'],
        createdBy: { connect: { id: context.user.id }},
        workspace: { connect: { id: workspace.id }}
      })

      if (course['default'] === true) {
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

      await Promise.all(course['concepts'].map(async concept => {
        let conceptData = {
          name: concept['name'],
          description: concept['description'],
          createdBy: { connect: { id: context.user.id } },
          workspace: { connect: { id: workspace.id }},
          courses: { connect: [{ id: courseObj.id }] }
        }
        if (concept['official'] === true) conceptData['official'] = concept['official']
        await context.prisma.createConcept(conceptData)
      }))

      return courseObj 
    }))

    let courseDictionary = {}
    courseData.forEach(course => {
      courseDictionary[course.name] = course.id
    })

    await Promise.all(courses.map(async (course, idx) => {
        if (Arrays.isArray(course['prerequisites'])) {
          await Promise.all(course['prerequisites'].map(async prerequisiteCourse => {
            let prerequisteCourseId = courseDictionary[prerequisiteCourse]
            // await context.prisma.createCourseLink({
            //   to: {
            //     connect: { 
            //       id: prerequisteCourseId
            //     }
            //   },
            //   from: {
            //     connect: {
            //       id: courseData[idx].id
            //     }
            //   }
            // })
            
          }))
        }
    }))    

    return workspace
  }
}

module.exports = PortMutations
