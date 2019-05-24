import { gql } from 'apollo-boost'

const ALL_COURSES = gql`
{
  allCourses {
    id
    name
    concepts {
      id
      name
      linksFromConcept {
        id
        to {
          id
        }
      }
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
          resources {
            id
            name
            description 
            urls {
              address
            }
          }
        }
        
      }
      
    }
  }
}
`

const FETCH_COURSE = gql`
query courseById($id: ID!) {
  courseById(id: $id) {
    id
    name
    concepts {
      id
      name
    }
  }
}
`


const COURSE_PREREQUISITE_COURSES = gql`
query courseById($id: ID!) {
  courseById(id: $id) {
    id
    prerequisiteCourses {
      id
      name
      concepts {
        id
        name
        linksFromConcept {
          id
          to {
            id
          }
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
    concepts {
      id
      name
      linksFromConcept {
        id
        to {
          id
        }
      }
    }
  }
}
`

const UPDATE_COURSE = gql`
mutation updateCourse($id: ID!, $name: String!) {
  updateCourse(id: $id, name: $name) {
    id
    name
    concepts {
      id
      name
      linksFromConcept {
        id
        to {
          id
        }
      }
    }
  }
}
`

const DELETE_COURSE = gql`
mutation deleteCourse($id: ID!) {
  deleteCourse(id: $id) {
    id
  }
}
`

const ADD_COURSE_AS_PREREQUISITE = gql`
mutation addCourseAsCoursePrerequisite($id: ID!, $prerequisite_id: ID!) {
  addCourseAsCoursePrerequisite(id: $id, prerequisite_id: $prerequisite_id) {
    id
    name
    prerequisiteCourses {
      id
      name
    }
  }
}
`

export { ALL_COURSES, CREATE_COURSE, UPDATE_COURSE, DELETE_COURSE, COURSE_AND_CONCEPTS, ADD_COURSE_AS_PREREQUISITE, FETCH_COURSE, COURSE_PREREQUISITE_COURSES }