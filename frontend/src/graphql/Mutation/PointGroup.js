import { gql } from 'apollo-boost'

const CREATE_POINTGROUP = gql`
mutation createPointGroup($name: String!, $startDate: String!, $endDate: String!, $maxPoints: Int!,
    $pointsPerConcept: Float!, $courseId: ID!, $workspaceId: ID!) {
  createPointGroup(name: $name, startDate: $startDate, endDate: $endDate, maxPoints: $maxPoints,
    pointsPerConcept: $pointsPerConcept, courseId: $courseId, workspaceId: $workspaceId) {
      id
      name
      startDate
      endDate
      maxPoints
      pointsPerConcept
      completions {
        id
        conceptAmount
        user {
          id
        }
      }
  }
}
`

const UPDATE_POINTGROUP = gql`
mutation updatePointGroup($id: ID!, $name: String!, $startDate: String!, $endDate: String!, 
    $maxPoints: Int!, $pointsPerConcept: Float!) {
  updatePointGroup(id: $id, name: $name, startDate: $startDate, endDate: $endDate, 
    maxPoints: $maxPoints, pointsPerConcept: $pointsPerConcept) {
      id
      name
      startDate
      endDate
      maxPoints
      pointsPerConcept
      completions {
        id
        conceptAmount
        user {
          id
        }
      }
  }
}
`

const DELETE_POINTGROUP = gql`
mutation deletePointGroup($id: ID!) {
  deletePointGroup(id: $id) {
    id
  }
}
`

export {
  CREATE_POINTGROUP,
  UPDATE_POINTGROUP,
  DELETE_POINTGROUP
}
