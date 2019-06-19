const authentication = require('./Authentication')
const course = require('./Course')
const courseLink = require('./CourseLink')

module.exports = {
  ...authentication,
  ...course,
  ...courseLink
}