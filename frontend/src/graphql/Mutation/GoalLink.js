import gql from 'graphql-tag'

const CREATE_GOAL_LINK = gql`
mutation createGoalLink($goalId: ID!, $courseId: ID!, $workspaceId: ID!) {
  createGoalLink(goalId: $goalId, courseId: $courseId, workspaceId: $workspaceId) {
    id
    course {
      id
    }
    goal {
      id
    }
    workspace {
      id
    }
  }
}
`

const DELETE_GOAL_LINK = gql`
mutation deleteGoalLink($id: ID!) {
  deleteGoalLink(id: $id) {
    id
    workspaceId
    courseId
  }
}
`

export {
  CREATE_GOAL_LINK,
  DELETE_GOAL_LINK
}