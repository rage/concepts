import gql from 'graphql-tag'

const CREATE_CONCEPT_OBJECTIVE_LINK_FRAGMENT = gql`
fragment createConceptObjectiveLinkData on ConceptObjectiveLink {
  id
  official
  frozen
  to {
    id
    course {
      id
    }
  }
  from {
    id
    course {
      id
    }
  }
}
`

const UPDATE_CONCEPT_OBJECTIVE_LINK_FRAGMENT = gql`
fragment updateConceptObjectiveLinkData on ConceptObjectiveLink {
  id
  official
  frozen
  to {
    id
  }
}
`

const DELETE_CONCEPT_OBJECTIVE_LINK_FRAGMENT = gql`
fragment deleteConceptObjectiveLinkData on DeletedObjectiveLink {
  id
  courseId
  objectiveId
}
`

export {
  CREATE_CONCEPT_OBJECTIVE_LINK_FRAGMENT,
  UPDATE_CONCEPT_OBJECTIVE_LINK_FRAGMENT,
  DELETE_CONCEPT_OBJECTIVE_LINK_FRAGMENT
}
