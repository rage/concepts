import React, { useEffect, useRef } from 'react'
import Typography from '@material-ui/core/Typography'

import Course from './Course'
import Masonry from './Masonry'
import { useEditCourseDialog } from '../../dialogs/course'
import { useInfoBox } from '../../components/InfoBox'

const CourseContainer = ({
  courseTrayOpen,
  courseLinks,
  courses,
  activeConceptIds,
  addingLink,
  setAddingLink,
  workspaceId,
  courseId,
  urlPrefix
}) => {

  const infoBox = useInfoBox()

  const connectionRef = useRef()
  const createConceptRef = useRef()

  useEffect(() => {
    if (courseLinks.length === 1 && courseLinks[0].from.concepts.length === 0) {
      infoBox.open(createConceptRef.current, 'right-start', 'CREATE_CONCEPT_PREREQ', 0, 20)
    } else if (addingLink) {
      infoBox.open(connectionRef.current, 'right-start', 'DRAW_LINK_END', 0, 20)
    }
  }, [addingLink, courseLinks])

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
            {courses.map((course, index) =>
              <Course
                key={course.id}
                course={course}
                connectionRef={index === 0 ? connectionRef : undefined}
                createConceptRef={(index === 0 && course.concepts.length === 0)
                  ? createConceptRef : undefined}
                activeConceptIds={activeConceptIds}
                addingLink={addingLink}
                setAddingLink={setAddingLink}
                openCourseDialog={openEditCourseDialog}
                activeCourseId={courseId}
                workspaceId={workspaceId}
                urlPrefix={urlPrefix}
              />
            )}
          </Masonry>}
        </div>
        :
        null
    }

    {/* Dialogs */}

    {CourseEditDialog}
  </>
}

export default CourseContainer
