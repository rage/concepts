import gql from 'graphql-tag'

const CREATE_CONCEPT_LINK_FRAGMENT = gql`
fragment createConceptLinkData on ConceptLink {
  id
  official
  frozen
  text
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

const UPDATE_CONCEPT_LINK_FRAGMENT = gql`
fragment updateConceptLinkData on ConceptLink {
  id
  official
  frozen
  text
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

const DELETE_CONCEPT_LINK_FRAGMENT = gql`
fragment deleteConceptLinkData on DeletedConceptLink {
  id
  courseId
  conceptId
}
`

export {
  CREATE_CONCEPT_LINK_FRAGMENT,
  UPDATE_CONCEPT_LINK_FRAGMENT,
  DELETE_CONCEPT_LINK_FRAGMENT
}
