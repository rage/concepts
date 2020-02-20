import gql from 'graphql-tag'

const CREATE_COURSE_LINK_FRAGMENT = gql`
fragment createCourseLinkData on CourseLink {
  id
  official
  frozen
  text
  weight
  to {
    id
  }
  from {
    id
    name
    official
    frozen
    tags {
      id
      name
      type
      priority
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
      tags {
        id
        name
        type
        priority
      }
      linksToConcept {
        id
        official
        frozen
        text
        weight
        from {
          id
        }
      }
      linksFromConcept {
        id
        official
        frozen
        text
        weight
        to {
          id
        }
      }
    }
  }
}
`

const UPDATE_COURSE_LINK_FRAGMENT = gql`
fragment updateCourseLinkData on CourseLink {
  id
  official
  frozen
  text
  weight
  to {
    id
  }
}
`

const DELETE_COURSE_LINK_FRAGMENT = gql`
fragment deleteCourseLinkData on DeletedCourseItem {
  id
  courseId
}
`

export {
  CREATE_COURSE_LINK_FRAGMENT,
  UPDATE_COURSE_LINK_FRAGMENT,
  DELETE_COURSE_LINK_FRAGMENT
}
