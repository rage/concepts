import React, { useMemo } from 'react'
import { makeStyles } from '@material-ui/core/styles'

import Course from './Course'
import Masonry from './Masonry'
import { useInfoBox } from '../../components/InfoBox'
import DividerWithText from '../../components/DividerWithText'
import { sortedCourses } from '../../lib/ordering'

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
  courseOrder,
  focusedConceptIds,
  collapsedCourseIds,
  toggleCollapse,
  addingLink,
  setAddingLink,
  flashLink,
  toggleFocus,
  workspaceId,
  courseId,
  urlPrefix
}) => {
  const classes = useStyles()
  const infoBox = useInfoBox()

  const orderedCourseLinks = useMemo(() => sortedCourses(courseLinks, courseOrder,
    courseLink => courseLink.from.id), [courseLinks, courseOrder])

  return <>
    <DividerWithText
      gridArea='contentHeader'
      content='Prerequisites'
      margin='0px 8px 0px 16px'
    />
    {
      courseLinks?.length > 0 ?
        <div onClick={() => setAddingLink(null)} className={classes.root}>
          <Masonry courseTrayOpen={courseTrayOpen}>
            {orderedCourseLinks.map((link, index) =>
              <Course
                key={link.id}
                courseLink={link}
                connectionRef={index === 0 ? infoBox.ref('mapper', 'DRAW_LINK') : undefined}
                createConceptRef={index === 0
                  ? infoBox.ref('mapper', 'CREATE_CONCEPT_PREREQ') : undefined}
                prereqFreezeRef={index === 0
                  ? infoBox.ref('mapper', 'FREEZE_PREREQ_COURSE') : undefined}
                focusedConceptIds={focusedConceptIds}
                collapsedCourseIds={collapsedCourseIds}
                toggleCollapse={toggleCollapse}
                addingLink={addingLink}
                setAddingLink={setAddingLink}
                flashLink={flashLink}
                toggleFocus={toggleFocus}
                activeCourseId={courseId}
                workspaceId={workspaceId}
                urlPrefix={urlPrefix}
              />
            )}
          </Masonry>
        </div>
        :
        null
    }
  </>
}

export default PrerequisiteContainer
