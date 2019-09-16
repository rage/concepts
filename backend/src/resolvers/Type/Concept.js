const { makeTypeResolvers } = require('./typeutil')

module.exports = {
  Concept: makeTypeResolvers('concept', [
    'linksToConcept',
    'linksFromConcept',
    'course',
    'resources',
    'createdBy',
    'workspace',
    'tags'
  ])
}
