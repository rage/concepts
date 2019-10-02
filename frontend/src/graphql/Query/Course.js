import { gql } from 'apollo-boost'

const COURSE_BY_ID = gql`
query courseById($id: ID!) {
  courseById(id: $id) {
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
    concepts {
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
  }
}
`

const LINKS_IN_COURSE = gql`
query linksInCourse($courseId: ID!) {
  linksInCourse: courseById(id: $courseId) {
    id
    concepts {
      id
      linksToConcept {
        id
        official
        frozen
        from {
          course {
            id
          }
          id
        }
      }
    }
  }
}
`

const COURSE_PREREQ_FRAGMENT = gql`
fragment courseAndConcepts on Course {
  __typename
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
  concepts {
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
}
`

const COURSE_PREREQUISITES = gql`
query courseAndPrerequisites($courseId: ID!) {
  courseAndPrerequisites: courseById(id: $courseId) {
    id
    name
    official
    frozen
    linksToCourse {
      id
      official
      frozen
      from {
        id
        __typename
        ...courseAndConcepts
      }
    }
  }
}
${COURSE_PREREQ_FRAGMENT}
`

export {
  COURSE_BY_ID,
  COURSE_PREREQUISITES,
  COURSE_PREREQ_FRAGMENT,
  LINKS_IN_COURSE
}
