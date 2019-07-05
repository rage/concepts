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
      console.log(validateData.errors.map(error => error.message).join('\n'))
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
