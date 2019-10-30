import gql from 'graphql-tag'

import {
  CREATE_COURSE_LINK_FRAGMENT,
  UPDATE_COURSE_LINK_FRAGMENT,
  DELETE_COURSE_LINK_FRAGMENT
} from '../Fragment'

const COURSE_LINK_CREATED_SUBSCRIPTION = gql`
subscription($workspaceId: ID!) {
  courseLinkCreated(workspaceId: $workspaceId) {
    ...createCourseLinkData
  }
}
${CREATE_COURSE_LINK_FRAGMENT}
`

const COURSE_LINK_UPDATED_SUBSCRIPTION = gql`
subscription($workspaceId: ID!) {
  courseLinkUpdated(workspaceId: $workspaceId) {
    ...updateCourseLinkData
  }
}
${UPDATE_COURSE_LINK_FRAGMENT}
`

const COURSE_LINK_DELETED_SUBSCRIPTION = gql`
subscription($workspaceId: ID!) {
  courseLinkDeleted(workspaceId: $workspaceId) {
    ...deleteCourseLinkData
  }
}
${DELETE_COURSE_LINK_FRAGMENT}
`

export {
  COURSE_LINK_CREATED_SUBSCRIPTION,
  COURSE_LINK_UPDATED_SUBSCRIPTION,
  COURSE_LINK_DELETED_SUBSCRIPTION
}
