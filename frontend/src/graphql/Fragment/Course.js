import gql from 'graphql-tag'

const CREATE_COURSE_FRAGMENT = gql`
fragment createCourseData on Course {
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
  linksToCourse {
    from {
      id
    }
  }
  conceptOrder
  objectiveOrder
  concepts {
    id
    name
    description
    level
    position
    official
    frozen
    course {
      id
    }
    linksToConcept {
      from {
        id
        name
        course {
          id
        }
      }
    }
  }
}
`

const UPDATE_COURSE_FRAGMENT = gql`
fragment updateCourseData on Course {
  id
  name
  description
  official
  frozen
  conceptOrder
  objectiveOrder
  tags {
    id
    name
    type
    priority
  }
}
`

export {
  CREATE_COURSE_FRAGMENT,
  UPDATE_COURSE_FRAGMENT
}
