import gql from 'graphql-tag'

import {
  CREATE_OBJECTIVE_FRAGMENT,
  UPDATE_OBJECTIVE_FRAGMENT,
  DELETE_OBJECTIVE_FRAGMENT
} from '../Fragment'

const UPDATE_OBJECTIVE = gql`
mutation updateObjective($id: ID!, $name:String, $description: String, $official: Boolean, 
                       $frozen: Boolean, $tags: [TagInput!]) {
  updateObjective(id: $id, name: $name, description: $description, 
                official: $official, frozen: $frozen,  tags: $tags) {
    ...updateObjectiveData
  }
}
${UPDATE_OBJECTIVE_FRAGMENT}
`

const CREATE_OBJECTIVE = gql`
mutation createObjective($name: String!, $description: String!, $official: Boolean, 
                        $frozen: Boolean,$workspaceId: ID!, $courseId: ID, $tags: [TagInput!]) {
  createObjective(name: $name, description: $description, official: $official, frozen: $frozen,
                workspaceId: $workspaceId, courseId: $courseId, tags:$tags) {
    ...createObjectiveData
  }
}
${CREATE_OBJECTIVE_FRAGMENT}
`

const DELETE_OBJECTIVE = gql`
mutation deleteObjective($id: ID!) {
  deleteObjective(id: $id) {
    ...deleteObjectiveData
  }
}
${DELETE_OBJECTIVE_FRAGMENT}
`

export {
  CREATE_OBJECTIVE,
  DELETE_OBJECTIVE,
  UPDATE_OBJECTIVE
}
