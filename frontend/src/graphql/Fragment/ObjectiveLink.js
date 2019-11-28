import gql from 'graphql-tag'

const CREATE_OBJECTIVE_LINK_FRAGMENT = gql`
fragment createObjectiveLinkData on ObjectiveLink {
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

const UPDATE_OBJECTIVE_LINK_FRAGMENT = gql`
fragment updateObjectiveLinkData on ObjectiveLink {
  id
  official
  frozen
  to {
    id
  }
}
`

const DELETE_OBJECTIVE_LINK_FRAGMENT = gql`
fragment deleteObjectiveLinkData on DeletedObjectiveLink {
  id
  courseId
  objectiveId
}
`

export {
  CREATE_OBJECTIVE_LINK_FRAGMENT,
  UPDATE_OBJECTIVE_LINK_FRAGMENT,
  DELETE_OBJECTIVE_LINK_FRAGMENT
}
