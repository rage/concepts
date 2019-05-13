import React from 'react'
import Concept from '../components/Concept'
import ConceptForm from './ConceptForm'
import { useQuery, useMutation } from 'react-apollo-hooks'

import { DELETE_CONCEPT, CREATE_CONCEPT, ADD_PREREQUISITE_CONCEPT } from '../services/ConceptService'
import { COURSE_AND_CONCEPTS } from '../services/CourseService'

const ConceptList = ({ course_id }) => {

  const { data, loading } = useQuery(COURSE_AND_CONCEPTS, {
    variables: { id: course_id }
  })

  const addPrerequisiteToConcept = useMutation(ADD_PREREQUISITE_CONCEPT, {
    refetchQueries: [{ query: COURSE_AND_CONCEPTS, variables: { id: course_id } }]
  })

  const createConcept = useMutation(CREATE_CONCEPT, {
    refetchQueries: [{ query: COURSE_AND_CONCEPTS, variables: { id: course_id } }]
  })

  const deleteConcept = useMutation(DELETE_CONCEPT, {
    refetchQueries: [{ query: COURSE_AND_CONCEPTS, variables: { id: course_id } }]
  })

  const onDelete = (id) => async () => {
    await deleteConcept({
      variables: { id }
    })
  }

  return (
    <div className="conceptList">
      {
        loading ?
          <div> Loading concepts... </div> :
          <div>
            <h3>{data.courseById && data.courseById.name}</h3>
            <table>
              <thead>
                <tr>
                  <th>
                    Prerequisites
                  </th>
                  <th>
                    Concept
                  </th>
                </tr>
              </thead>

              <tbody>
                {data.courseById && data.courseById.concepts.map(concept => {
                  return <Concept
                    onDelete={onDelete}
                    key={concept.id}
                    concept={concept}
                    onConnect={addPrerequisiteToConcept}
                    course_id={course_id}
                  />
                })}
              </tbody>
            </table>
          </div>
      }
      <ConceptForm createConcept={createConcept} course_id={course_id} />
    </div>
  )
}

export default ConceptList