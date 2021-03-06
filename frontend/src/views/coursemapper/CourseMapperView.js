import React, { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { makeStyles } from '@material-ui/core/styles'
import { Button } from '@material-ui/core'
import {
  ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon
} from '@material-ui/icons'

import { WORKSPACE_BY_ID, COURSE_BY_ID, COURSE_PREREQUISITES } from '../../graphql/Query'
import { useInfoBox } from '../../components/InfoBox'
import NotFoundView from '../error/NotFoundView'
import DividerWithText from '../../components/DividerWithText'
import LoadingBar from '../../components/LoadingBar'
import CourseTray from './CourseTray'
import CourseContainer from './CourseContainer'
import {
  useManyUpdatingSubscriptions,
  useUpdatingSubscription
} from '../../apollo/useUpdatingSubscription'

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
  // This is hacky masking CSS to hide concept links from the header
  // (so they don't overlap with the header texts and instead are cut off below the header)
  headerLineMask: {
    position: 'absolute',
    backgroundColor: '#eee',
    width: '100%',
    // Height of content header (see gridTemplate above) plus 10px (see transform below)
    height: '52px',
    zIndex: 5,
    // Translate it up so the gap between the topbar and the content is covered
    transform: 'translateY(-10px)'
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

  useUpdatingSubscription('workspace', 'update', {
    variables: { workspaceId }
  })

  useManyUpdatingSubscriptions(
    ['course', 'course link', 'concept', 'concept link'],
    ['create', 'delete', 'update'],
    { variables: { workspaceId } }
  )

  const workspaceQuery = useQuery(WORKSPACE_BY_ID, {
    variables: { id: workspaceId }
  })

  const prereqQuery = useQuery(COURSE_PREREQUISITES, {
    variables: { courseId, workspaceId }
  })

  const courseQuery = useQuery(COURSE_BY_ID, {
    variables: { id: courseId }
  })

  const courseLinks = prereqQuery.data?.courseAndPrerequisites.linksToCourse
  const courseLinkMap = useMemo(
    () => new Map(courseLinks?.map(link => [link.from.id, link.id])), [courseLinks])

  const handleTrayToggle = () => {
    setCourseTrayOpen(!courseTrayOpen)
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('redrawConceptLink'))
      infoBox.redrawIfOpen('mapper', 'OPEN_COURSE_TRAY')
    }, 0)
  }

  if (workspaceQuery.error) {
    return <NotFoundView message='Workspace not found' />
  } else if (courseQuery.error || prereqQuery.error) {
    return <NotFoundView message='Course not found' />
  } else if (prereqQuery.loading || courseQuery.loading || workspaceQuery.loading) {
    return <LoadingBar id='course-view' />
  }
  const course = courseQuery.data.courseById
  const workspace = workspaceQuery.data.workspaceById

  return (
    <main className={`${classes.root} ${courseTrayOpen ? classes.courseTrayOpen : ''}`}>
      <div className={classes.headerLineMask} />
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
        activeCourseId={course.id}
        courseLinks={courseLinkMap}
        workspace={workspace}
        urlPrefix={urlPrefix}
      />}
      <CourseContainer
        urlPrefix={urlPrefix} courseTrayOpen={courseTrayOpen} courseLinkMap={courseLinkMap}
        workspace={workspace} course={course} courseLinks={courseLinks}
      />
    </main>
  )
}

export default CourseMapperView
