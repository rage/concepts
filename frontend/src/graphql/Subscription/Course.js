import gql from 'graphql-tag'

import {
  CREATE_COURSE_FRAGMENT,
  UPDATE_COURSE_FRAGMENT
} from '../Fragment'

const COURSE_CREATED_SUBSCRIPTION = gql`
subscription($workspaceId: ID!) {
  courseCreated(workspaceId:$workspaceId) {
    ...createCourseData
  }
}
${CREATE_COURSE_FRAGMENT}
`

const COURSE_UPDATED_SUBSCRIPTION = gql`
subscription($workspaceId:ID!) {
  courseUpdated(workspaceId:$workspaceId) {
    ...updateCourseData
  }
}
${UPDATE_COURSE_FRAGMENT}
`

const COURSE_DELETED_SUBSCRIPTION = gql`
subscription($workspaceId:ID!) {
  courseDeleted(workspaceId:$workspaceId) {
    id
  }
}
`

export {
  COURSE_CREATED_SUBSCRIPTION,
  COURSE_DELETED_SUBSCRIPTION,
  COURSE_UPDATED_SUBSCRIPTION
}
