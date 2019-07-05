const { checkAccess } = require('../../accessControl')
const schema = require('./port.schema')
const Ajv = require('ajv')

const ajv = Ajv()
const validateData = ajv.compile(schema)

const PortMutations = {
  async portData(root, args, context) {
    checkAccess(context, { allowStaff: true, allowStudent: true })
    let json

    try {
      json = JSON.parse(args.data)
    } catch (err) {
      console.log('Error parsing JSON: ', err)
      return null
    }
    if (!validateData(json)) {
      for (const error of validateData.errors) {
        console.log(error)
      }
      //console.log(validateData.errors.map(error => error.message).join('\n'))
      // TODO maybe show error to client (or just add client-side validation for displaying errors)
      return null
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
        createdBy: { connect: { id: context.user.id } },
        workspace: { connect: { id: workspace.id } }
      })

      if (json['defaultCourse'] === course['name']) {
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

      let concepts = await Promise.all(course['concepts'].map(async concept => {
        let conceptData = {
          name: concept['name'],
          description: concept['description'],
          createdBy: { connect: { id: context.user.id } },
          workspace: { connect: { id: workspace.id } },
          courses: { connect: [{ id: courseObj.id }] }
        }
        if (concept['official'] === true) conceptData['official'] = concept['official']
        return await context.prisma.createConcept(conceptData)
      }))

      return {...courseObj, concepts}
    }))

    let courseDictionary = {}
    let conceptDictionary = {}
    courseData.forEach(course => {
      courseDictionary[course.name] = course.id
      course.concepts.forEach(concept => {
        conceptDictionary[concept.name] = concept.id
      })
    })

    await Promise.all(courses.map(async (course, idx) => {
      // Link course prerequisites  
      if (Array.isArray(course['prerequisites'])) {
        await Promise.all(course['prerequisites'].map(async prerequisiteCourse => {
          let prerequisteCourseId = courseDictionary[prerequisiteCourse]
          let courseLinkData = {
            to: { connect: { id: courseData[idx].id } },
            from: { connect: { id: prerequisteCourseId } },
            workspace: { connect: { id: workspace.id } },
            createdBy: { connect: { id: context.user.id } }
          }
          if (typeof prerequisiteCourse['official'] === 'boolean') {
            courseLinkData.official = prerequisiteCourse['official']
          }
          await context.prisma.createCourseLink(courseLinkData)
        }))
      }
      // Link concept prerequisites
      

      for (const concept of course['concepts']) {
        if (Array.isArray(concept['prerequisites'])) {
          for (const prerequisiteConcept of concept['prerequisites']) {
            let conceptLinkData = {
              to: { connect: { id: conceptDictionary[concept['name']] } },
              from: { connect: { id: conceptDictionary[prerequisiteConcept['name']] } },
              createdBy: { connect: { id: context.user.id } },
              workspace: { connect: { id: workspace.id } }
            }
            if (typeof prerequisiteConcept['official'] === 'boolean') {
              conceptLinkData.official = prerequisiteConcept['official']
            }
            await context.prisma.createConceptLink(conceptLinkData)
          }
        }
      }
    }))

    return workspace
  }
}

module.exports = PortMutations
