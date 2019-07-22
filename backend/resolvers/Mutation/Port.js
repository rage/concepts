const { checkAccess, checkPrivilege } = require('../../accessControl')
const schema = require('./port.schema')
const Ajv = require('ajv')

const ajv = Ajv()
const validateData = ajv.compile(schema)

const PortMutations = {
  async importData(root, args, context) {
    await checkAccess(context, { allowStaff: true, allowStudent: true })
    let json

    try {
      json = JSON.parse(args.data)
    } catch (err) {
      throw new Error('Error parsing JSON: ' + err.message)
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
    if (typeof json['workspaceId'] === 'string') {
      checkPrivilege(context, { requiredPrivilege: 'WRITE', workspaceId: json['workspaceId'] })
      workspace = await context.prisma.workspace({
        id: json['workspaceId']
      })
      if (workspace === null) {
        throw Error('No such workspace')
      }
    } else if (typeof json['workspace'] === 'string') {
      workspace = await context.prisma.createWorkspace({
        name: json['workspace'],
        participants: {
          create: [{
            privilege: 'OWNER',
            user: {
              connect: { id: context.user.id }
            }
          }]
        }
      })
    }

    // Save data to prisma
    const courses = json['courses']

    const courseData = await Promise.all(courses.map(async course => {
      const courseObj = await context.prisma.createCourse({
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

      const concepts = await Promise.all(course['concepts'].map(async concept => {
        const conceptData = {
          name: concept['name'],
          description: concept['description'],
          createdBy: { connect: { id: context.user.id } },
          workspace: { connect: { id: workspace.id } },
          courses: { connect: [{ id: courseObj.id }] }
        }
        if (concept['official'] === true) conceptData['official'] = concept['official']
        return await context.prisma.createConcept(conceptData)
      }))

      return { ...courseObj, concepts }
    }))

    const courseDictionary = {}
    courseData.forEach(course => {
      courseDictionary[course.name] = {
        id: course.id,
        concepts: {}
      }
      course.concepts.forEach(concept => {
        courseDictionary[course.name].concepts[concept.name] = concept.id
      })
    })

    await Promise.all(courses.map(async (course, idx) => {
      // Link course prerequisites
      if (Array.isArray(course['prerequisites'])) {
        await Promise.all(course['prerequisites'].map(async prerequisiteCourse => {
          const prerequisteCourseId = courseDictionary[prerequisiteCourse].id
          const courseLinkData = {
            to: { connect: { id: courseData[idx].id } },
            from: { connect: { id: prerequisteCourseId } },
            workspace: { connect: { id: workspace.id } },
            createdBy: { connect: { id: context.user.id } }
          }
          if (typeof prerequisiteCourse['official'] === 'boolean') {
            courseLinkData.official = prerequisiteCourse['official']
          }
          await context.prisma.createCourseLink(courseLinkData)
        }))
      }
      // Link concept prerequisite
      for (const concept of course['concepts']) {
        if (Array.isArray(concept['prerequisites'])) {
          for (const prerequisiteConcept of concept['prerequisites']) {
            const toConceptId = courseDictionary[course['name']].concepts[concept['name']]
            let fromConceptIds
            if (prerequisiteConcept['course']) {
              fromConceptIds = [courseDictionary[prerequisiteConcept['course']]]
                .concepts[prerequisiteConcept['name']]
            } else {
              fromConceptIds = Object.values(courseDictionary)
                .filter(course => Object.prototype.hasOwnProperty.call(
                  course.concepts, prerequisiteConcept['name']))
                .map(course => course.concepts[prerequisiteConcept['name']])
            }
            await Promise.all(fromConceptIds.map(async (fromConceptId) => {
              const conceptLinkData = {
                to: { connect: { id: toConceptId } },
                from: { connect: { id: fromConceptId } },
                createdBy: { connect: { id: context.user.id } },
                workspace: { connect: { id: workspace.id } }
              }
              if (typeof prerequisiteConcept['official'] === 'boolean') {
                conceptLinkData.official = prerequisiteConcept['official']
              }
              await context.prisma.createConceptLink(conceptLinkData)
            }))
          }
        }
      }
    }))

    return workspace
  }
}

module.exports = PortMutations
