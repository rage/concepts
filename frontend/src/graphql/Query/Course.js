import { gql } from 'apollo-boost'

const COURSES_BY_WORKSPACE = gql`
query coursesByWorkspace($workspaceId: ID!) {
  coursesByWorkspace(workspaceId: $workspaceId) {
    id
    name
    official
    tags {
      id
      name
      type
      priority
    }
  }
}
`

const COURSE_BY_ID = gql`
query courseById($id: ID!) {
  courseById(id: $id) {
    id
    name
    official
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
      tags {
        id
        name
        type
        priority
      }
      courses {
        id
      }
      linksFromConcept {
        id
        official
        to {
          id
        }
      }
      linksToConcept {
        id
        official
        from {
          id
        }
      }
    }
  }
}
`

const COURSE_PREREQ_FRAGMENT = gql`
fragment courseAndConcepts on Course {
    __typename
    id
    name
    official
    concepts {
      id
      name
      description
      official
      tags {
        id
        name
        type
        priority
      }
      courses {
        id
      }
      linksFromConcept {
        id
        official
        to {
          id
        }
      }
      linksToConcept {
        id
        official
        from {
          id
        }
      }
    }
  }
`

const COURSE_PREREQUISITES = gql`
query courseAndPrerequisites($courseId: ID!) {
  courseAndPrerequisites(courseId: $courseId) {
    id
    name
    official
    linksToCourse {
      id
      from {
        id
        __typename
        ...courseAndConcepts
      }
    }
  }
}
${COURSE_PREREQ_FRAGMENT}
`

export {
  COURSES_BY_WORKSPACE,
  COURSE_BY_ID,
  COURSE_PREREQUISITES,
  COURSE_PREREQ_FRAGMENT
}
