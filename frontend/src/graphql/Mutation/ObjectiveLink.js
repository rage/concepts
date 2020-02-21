import gql from 'graphql-tag'

const CREATE_OBJECTIVE_LINK = gql`
mutation createObjectiveLink($objectiveId: ID!, $courseId: ID!, $workspaceId: ID!) {
    __typename
    id
    text
    weight
    course {
      id
    }
    objective {
      id
    }
    workspace {
      id
    }
}
`

const DELETE_OBJECTIVE_LINK = gql`
mutation deleteObjectiveLink($id: ID!) {
  deleteObjectiveLink(id: $id) {
    __typename
    id
    workspaceId
    courseId
  }
}
`

const UPDATE_OBJECTIVE_LINK = gql`
mutation updateObjectiveLink($id: ID!, text: String, weight: int) {
  updateObjectiveLink(id: $id, text: $text, weight: $weight) {
    __typename
    id
    text
    weight
    course {
      id
    }
    objective {
      id
    }
    workspace {
      id
    }
  }
}
`

export {
  CREATE_OBJECTIVE_LINK,
  DELETE_OBJECTIVE_LINK,
  UPDATE_OBJECTIVE_LINK
}