import gql from 'graphql-tag'

const CREATE_CONCEPT_FRAGMENT = gql`
fragment createConceptData on Concept {
  id
  name
  description
  official
  frozen
  tags {
    id
    name
    type
    priority
  }
  course {
    id
  }
  linksFromConcept {
    id
    official
    frozen
    to {
      id
    }
  }
  linksToConcept {
    id
    official
    frozen
    from {
      id
    }
  }
}
`

const UPDATE_CONCEPT_FRAGMENT = gql`
fragment updateConceptData on Concept {
  id
  name
  description
  official
  frozen
  tags {
    id
    name
    type
    priority
  }
  course {
    id
  }
}
`

const DELETE_CONCEPT_FRAGMENT = gql`
fragment deleteConceptData on Concept {
  id
  courseId
}
`

export {
  CREATE_CONCEPT_FRAGMENT,
  UPDATE_CONCEPT_FRAGMENT,
  DELETE_CONCEPT_FRAGMENT
}
