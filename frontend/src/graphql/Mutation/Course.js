import gql from 'graphql-tag'

import {
  CREATE_COURSE_FRAGMENT,
  UPDATE_COURSE_FRAGMENT
} from '../Fragment'

const CREATE_COURSE = gql`
mutation createCourse($name: String!, $description: String, $workspaceId: ID!, $official: Boolean,
                      $frozen: Boolean, $tags: [TagInput!]) {
  createCourse(name: $name, description: $description, workspaceId: $workspaceId,
               official: $official, frozen: $frozen, tags: $tags) {
    ...createCourseData
  }
}
${CREATE_COURSE_FRAGMENT}
`

const UPDATE_COURSE = gql`
mutation updateCourse($id: ID!, $name: String, $description: String, $official: Boolean,
                      $frozen: Boolean, $tags: [TagInput!], $conceptOrder: [ID!],
                      $objectiveOrder: [ID!]) {
  updateCourse(id: $id, name: $name, description: $description, official: $official,
               frozen: $frozen, tags: $tags, conceptOrder: $conceptOrder,
               objectiveOrder: $objectiveOrder) {
    ...updateCourseData
  }
}
${UPDATE_COURSE_FRAGMENT}
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
