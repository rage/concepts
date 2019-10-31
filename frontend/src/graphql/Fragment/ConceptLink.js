import gql from 'graphql-tag'

const CREATE_CONCEPT_LINK_FRAGMENT = gql`
fragment createConceptLinkData on ConceptLink {
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

const DELETE_CONCEPT_LINK_FRAGMENT = gql`
fragment deleteConceptLinkData on DeletedCourseItem {
  id
  courseId
}
`

export {
  CREATE_CONCEPT_LINK_FRAGMENT,
  DELETE_CONCEPT_LINK_FRAGMENT
}
