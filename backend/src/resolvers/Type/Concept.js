const { makeTypeResolvers } = require('./typeutil')

module.exports = {
  Concept: makeTypeResolvers('concept', [
    'linksToConcept',
    'linksFromConcept',
    'courses',
    'resources',
    'createdBy',
    'workspace'
  ])
}
