import React, { useEffect, useRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'

import Course from './Course'
import Masonry from './Masonry'
import { useInfoBox } from '../../components/InfoBox'
import DividerWithText from '../../components/DividerWithText'

const useStyles = makeStyles({
  root: {
    gridArea: 'courses',
    overflowY: 'auto',
    marginLeft: '8px'
  }
})

const PrerequisiteContainer = ({
  courseTrayOpen,
  courseLinks,
  focusedConceptIds,
  addingLink,
  setAddingLink,
  toggleFocus,
  workspaceId,
  courseId,
  activeCourse,
  urlPrefix
}) => {
  const classes = useStyles()
  const infoBox = useInfoBox()
  const connectionRef = useRef()

  /* FIXME
  useEffect(() => {
    const activeCourseHasPrereqConcepts = activeCourse.concepts.find(concept =>
      concept.linksToConcept.length > 0)
    if (courseLinks.length === 1 && courseLinks[0].from.concepts.length === 0) {
      infoBox.open(createConceptRef.current, 'right-start', 'CREATE_CONCEPT_PREREQ', 0, 20)
    } else if (courseLinks.length > 0 && !addingLink && !activeCourseHasPrereqConcepts) {
      infoBox.open(connectionRef.current, 'right-start', 'DRAW_LINK_START', 0, 20)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCourse.concepts, addingLink, courseLinks])*/

  return <>
    <DividerWithText
      gridArea='contentHeader'
      content='Prerequisites'
      margin='0px 8px 0px 16px'
    />
    {
      courseLinks && courseLinks.length !== 0 ?
        <div onClick={() => setAddingLink(null)} className={classes.root}>
          {courseLinks && <Masonry courseTrayOpen={courseTrayOpen}>
            {courseLinks.map((link, index) =>
              <Course
                key={link.id}
                courseLink={link}
                connectionRef={index === 0 ? connectionRef : undefined}
                createConceptRef={(index === 0 && link.from.concepts.length === 0)
                  ? infoBox.current.ref('mapper', 'CREATE_CONCEPT_PREREQ') : undefined}
                focusedConceptIds={focusedConceptIds}
                addingLink={addingLink}
                setAddingLink={setAddingLink}
                toggleFocus={toggleFocus}
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
  </>
}

export default PrerequisiteContainer
