import gql from 'graphql-tag'

import {
  CREATE_COURSE_LINK_FRAGMENT,
  UPDATE_COURSE_LINK_FRAGMENT,
  DELETE_COURSE_LINK_FRAGMENT
} from '../Fragment'

const CREATE_COURSE_LINK = gql`
mutation createCourseLink($to: ID!, $from: ID!, $workspaceId: ID!, $official: Boolean,
                          $text: String, $weight: Int) {
  createCourseLink(to:$to, from:$from, workspaceId: $workspaceId, official: $official,
                   text: $text, weight: $weight) {
    ...createCourseLinkData
  }
}
${CREATE_COURSE_LINK_FRAGMENT}
`

const UPDATE_COURSE_LINK = gql`
mutation updateCourseLink($id: ID!, $frozen: Boolean, $official: Boolean, $text: String,
                          $weight: Int) {
  updateCourseLink(id: $id, official: $official, frozen: $frozen, text: $text, weight: $weight) {
    ...updateCourseLinkData
  }
}
${UPDATE_COURSE_LINK_FRAGMENT}
`

const DELETE_COURSE_LINK = gql`
mutation deleteCourseLink($id: ID!) {
  deleteCourseLink(id: $id) {
    ...deleteCourseLinkData
  }
}
${DELETE_COURSE_LINK_FRAGMENT}
`

export {
  CREATE_COURSE_LINK,
  DELETE_COURSE_LINK,
  UPDATE_COURSE_LINK
}
