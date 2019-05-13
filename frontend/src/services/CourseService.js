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

export { ALL_COURSES, CREATE_COURSE, DELETE_COURSE }