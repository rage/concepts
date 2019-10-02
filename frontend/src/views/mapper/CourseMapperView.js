import React, { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation } from 'react-apollo-hooks'
import { makeStyles } from '@material-ui/core/styles'
import { Button } from '@material-ui/core'
import {
  ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon
} from '@material-ui/icons'

import { WORKSPACE_BY_ID, COURSE_BY_ID, COURSE_PREREQUISITES } from '../../graphql/Query'
import { DELETE_CONCEPT_LINK, UPDATE_COURSE } from '../../graphql/Mutation'
import { useLoginStateValue } from '../../store'
import cache from '../../apollo/update'
import { useInfoBox } from '../../components/InfoBox'
import NotFoundView from '../error/NotFoundView'
import DividerWithText from '../../components/DividerWithText'
import LoadingBar from '../../components/LoadingBar'
import PrerequisiteContainer from './PrerequisiteContainer'
import CourseTray from './CourseTray'
import ActiveCourse from './ActiveCourse'
import MapperLinks from './MapperLinks'
import CourseContainer from './CourseContainer'

const useStyles = makeStyles(() => ({
  root: {
    display: 'grid',
    // For some reason, this makes the 1fr sizing work without needing to hardcode heights of other
    // objects in the parent-level grid.
    overflow: 'hidden',
    gridTemplate: `"traySpacer traySpacer contentHeader activeHeader" 42px
                   "courseTray trayButton courses       activeCourse" 1fr
                  / 0          64px       8fr           3fr`,
    '&$courseTrayOpen': {
      gridTemplateColumns: '3fr 64px 7fr 3fr'
    },
    '@media screen and (max-width: 1999px)': {
      gridTemplateColumns: '0 64px 6fr 3fr',
      '&$courseTrayOpen': {
        gridTemplateColumns: '3fr 64px 5fr 3fr'
      }
    },
    '@media screen and (max-width: 1499px)': {
      gridTemplateColumns: '0 64px 4fr 3fr',
      '&$courseTrayOpen': {
        gridTemplateColumns: '3fr 64px 3fr 3fr'
      }
    }
  },
  courseTrayOpen: {}
}))

const CourseMapperView = ({ courseId, workspaceId, urlPrefix }) => {
  const classes = useStyles()
  const [courseTrayOpen, setCourseTrayOpen] = useState(false)

  const infoBox = useInfoBox()

  useEffect(() => {
    infoBox.setView('mapper')
    return () => infoBox.unsetView('mapper')
  }, [infoBox])

  const workspaceQuery = useQuery(WORKSPACE_BY_ID, {
    variables: { id: workspaceId }
  })

  const prereqQuery = useQuery(COURSE_PREREQUISITES, {
    variables: { courseId, workspaceId }
  })

  const courseQuery = useQuery(COURSE_BY_ID, {
    variables: { id: courseId }
  })

  const handleTrayToggle = () => {
    setCourseTrayOpen(!courseTrayOpen)
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('redrawConceptLink'))
      infoBox.redrawIfOpen('mapper', 'OPEN_COURSE_TRAY')
    }, 0)
  }

  if (workspaceQuery.error) {
    return <NotFoundView message='Workspace not found' />
  } else if (courseQuery.error) {
    return <NotFoundView message='Course not found' />
  } else if (!prereqQuery.data.courseAndPrerequisites || !courseQuery.data.courseById
      || !workspaceQuery.data.workspaceById) {
    return <LoadingBar id='course-view' />
  }

  return <>
    <div className={`${classes.root} ${courseTrayOpen ? classes.courseTrayOpen : ''}`}>
      <DividerWithText
        gridArea='traySpacer' content='Courses in workspace' hidden={!courseTrayOpen}
      />
      <Button
        ref={infoBox.ref('mapper', 'OPEN_COURSE_TRAY')}
        style={{
          gridArea: 'trayButton',
          width: '48px',
          height: '48px',
          boxShadow: 'none',
          borderRadius: '0 4px 4px 0',
          position: 'relative'
        }}
        variant='contained'
        color='primary'
        onClick={handleTrayToggle}
      >
        {courseTrayOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </Button>
      {courseTrayOpen && <CourseTray
        activeCourseId={courseQuery.data.courseById.id}
        courseLinks={prereqQuery.data.courseAndPrerequisites.linksToCourse}
        courses={workspaceQuery.data.workspaceById.courses}
        workspaceId={workspaceQuery.data.workspaceById.id}
        urlPrefix={urlPrefix}
      />}
      <CourseContainer
        courseId={courseId} workspaceId={workspaceId} urlPrefix={urlPrefix}
        workspaceQuery={workspaceQuery} prereqQuery={prereqQuery} courseQuery={courseQuery}
        courseTrayOpen={courseTrayOpen}
      />
    </div>
  </>
}

export default CourseMapperView
