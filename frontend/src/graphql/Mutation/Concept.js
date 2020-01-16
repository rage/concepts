import gql from 'graphql-tag'

import {
  CREATE_CONCEPT_FRAGMENT,
  UPDATE_CONCEPT_FRAGMENT,
  DELETE_CONCEPT_FRAGMENT
} from '../Fragment'

const UPDATE_CONCEPT = gql`
mutation updateConcept($id: ID!, $name:String, $description: String, $level: ConceptLevel,
                       $position: String, $official: Boolean,  $frozen: Boolean, $tags: [TagInput!]
                       ) {
  updateConcept(id: $id, name: $name, description: $description, level: $level, position: $position,
                official: $official, frozen: $frozen, tags: $tags) {
    ...updateConceptData
  }
}
${UPDATE_CONCEPT_FRAGMENT}
`

const CREATE_CONCEPT = gql`
mutation createConcept($name: String!, $description: String!, $level: ConceptLevel!,
                       $position: String, $official: Boolean, $frozen: Boolean, $workspaceId: ID!,
                       $courseId: ID, $tags: [TagInput!]) {
  createConcept(name: $name, description: $description, level: $level, position: $position,
                official: $official, frozen: $frozen, workspaceId: $workspaceId,
                courseId: $courseId, tags:$tags) {
    ...createConceptData
  }
}
${CREATE_CONCEPT_FRAGMENT}
`

const DELETE_CONCEPT = gql`
mutation deleteConcept($id: ID!) {
  deleteConcept(id: $id) {
    ...deleteConceptData
  }
}
${DELETE_CONCEPT_FRAGMENT}
`

const DELETE_MANY_CONCEPTS = gql`
mutation deleteManyConcepts($ids: [ID!]!) {
  deleteManyConcepts(ids: $ids) {
    ids
    courseId
  }
}
`

const UPDATE_MANY_CONCEPTS = gql`
mutation updateManyConcepts($concepts: [ConceptInput!]!) {
  updateManyConcepts(concepts: $concepts) {
    ...updateConceptData
  }
}
${UPDATE_CONCEPT_FRAGMENT}
`

export {
  CREATE_CONCEPT,
  DELETE_CONCEPT,
  UPDATE_CONCEPT,
  DELETE_MANY_CONCEPTS,
  UPDATE_MANY_CONCEPTS
}
