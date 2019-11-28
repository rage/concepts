import gql from 'graphql-tag'

const CREATE_OBJECTIVE_FRAGMENT = gql`
fragment createObjectiveData on Objective {
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
  linksFromObjective {
    id
    official
    frozen
    to {
      id
    }
  }
  linksToObjective {
    id
    official
    frozen
    from {
      id
    }
  }
  conceptLinks {
    id
    official
    frozen
    from {
      id
    }
  }
}
`

const UPDATE_OBJECTIVE_FRAGMENT = gql`
fragment updateObjectiveData on Objective {
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

const DELETE_OBJECTIVE_FRAGMENT = gql`
fragment deleteObjectiveData on DeletedCourseItem {
  id
  courseId
}
`

export {
  CREATE_OBJECTIVE_FRAGMENT,
  UPDATE_OBJECTIVE_FRAGMENT,
  DELETE_OBJECTIVE_FRAGMENT
}
