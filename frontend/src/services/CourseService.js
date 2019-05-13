import { gql } from 'apollo-boost'

const ALL_COURSES = gql`
{
  allCourses {
    id
    name
    concepts {
      id
      name
    }
  }
}
`

const COURSE_AND_CONCEPTS = gql`
query courseAndConcepts($id: ID!) {
  courseById(id: $id) {
    id
    name
    concepts {
      id
      name
      description
      official
      linksToConcept {
        from{
          id
          name
          description
          official
        }
      }
    }
  }
}
`

const CREATE_COURSE = gql`
mutation createCourse($name: String!) {
  createCourse(name: $name) {
    id
    name
  }
}
`

const DELETE_COURSE = gql`
mutation deleteCourse($id: ID!) {
  deleteCourse(id: $id) {
    id
    name
  }
}
`

export { ALL_COURSES, CREATE_COURSE, DELETE_COURSE, COURSE_AND_CONCEPTS }