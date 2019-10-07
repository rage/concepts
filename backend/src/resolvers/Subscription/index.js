const concept = require('./Concept')
const conceptLink = require('./ConceptLink')
const course = require('./Course')

module.exports = {
  ...concept,
  ...conceptLink,
  ...course 
}