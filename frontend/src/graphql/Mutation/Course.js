import { gql } from 'apollo-boost'

const CREATE_COURSE = gql`
mutation createCourse($name: String!, $workspaceId: ID!, $official: Boolean,
                      $frozen: Boolean, $tags: [TagInput!]) {
  createCourse(name: $name, workspaceId: $workspaceId, official: $official,
               frozen: $frozen, tags: $tags) {
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
    linksToCourse {
      from {
        id
      }
    }
    concepts {
      id
      name
      description
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
}
`

const UPDATE_COURSE = gql`
mutation updateCourse($id: ID!, $name: String!, $official: Boolean,
                      $frozen: Boolean, $tags: [TagInput!]) {
  updateCourse(id: $id, name: $name, official: $official, frozen: $frozen, tags: $tags) {
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
}
`

const DELETE_COURSE = gql`
mutation deleteCourse($id: ID!) {
  deleteCourse(id: $id) {
    id
  }
}
`

export {
  CREATE_COURSE,
  UPDATE_COURSE,
  DELETE_COURSE
}
