import React from 'react'
import Course from './Course'
import Typography from '@material-ui/core/Typography'

import Masonry from './Masonry'

import useCreateConceptDialog from './useCreateConceptDialog'
import useEditConceptDialog from './useEditConceptDialog'
import useEditCourseDialog from './useEditCourseDialog'

const GuidedCourseContainer = ({
  courseTrayOpen,
  activeCourse,
  courses,
  activeConceptIds,
  addingLink,
  setAddingLink,
  workspaceId,
  courseId
}) => {

  const {
    openCreateConceptDialog,
    ConceptCreateDialog
  } = useCreateConceptDialog(activeCourse, workspaceId)

  const {
    openEditConceptDialog,
    ConceptEditDialog
  } = useEditConceptDialog(activeCourse, workspaceId)

  const { openEditCourseDialog,
    CourseEditDialog
  } = useEditCourseDialog(workspaceId)

  return <>
    <Typography style={{ gridArea: 'contentHeader', margin: '16px' }} variant='h4'>
      Prerequisites
    </Typography>
    {
      courses && courses.length !== 0 ?
        <div onClick={() => setAddingLink(null)} style={{ gridArea: 'courses', overflowY: 'auto' }}>
          {courses && <Masonry courseTrayOpen={courseTrayOpen}>
            {courses.map(course =>
              <Course
                key={course.id}
                course={course}
                activeConceptIds={activeConceptIds}
                addingLink={addingLink}
                setAddingLink={setAddingLink}
                openCourseDialog={openEditCourseDialog}
                openConceptDialog={openCreateConceptDialog}
                openConceptEditDialog={openEditConceptDialog}
                activeCourseId={courseId}
                workspaceId={workspaceId}
              />
            )}
          </Masonry>}
        </div>
        :
        null
    }

    {/* Dialogs */}

    {CourseEditDialog}
    {ConceptCreateDialog}
    {ConceptEditDialog}
  </>
}

export default GuidedCourseContainer
