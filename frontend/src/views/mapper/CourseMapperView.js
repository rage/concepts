import React, { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation } from 'react-apollo-hooks'
import { makeStyles } from '@material-ui/core/styles'
import { Menu, MenuItem, Button } from '@material-ui/core'
import {
  ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon
} from '@material-ui/icons'

import { WORKSPACE_BY_ID, COURSE_BY_ID, COURSE_PREREQUISITES } from '../../graphql/Query'
import { DELETE_CONCEPT_LINK, UPDATE_COURSE } from '../../graphql/Mutation'
import PrerequisiteContainer from './PrerequisiteContainer'
import CourseTray from './CourseTray'
import ActiveCourse from './ActiveCourse'
import { useLoginStateValue } from '../../store'
import cache from '../../apollo/update'
import { ConceptLink } from './concept'
import { useInfoBox } from '../../components/InfoBox'
import NotFoundView from '../error/NotFoundView'
import DividerWithText from '../../components/DividerWithText'
import LoadingBar from '../../components/LoadingBar'

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
  courseTrayOpen: {},
  conceptLinkFlash: {
    animation: '$flash 3s'
  },
  '@keyframes flash': {
    '0%': { borderTopColor: '#f50057' },
    '25%': { borderTopColor: '#f50057' },
    '100%': { borderTopColor: 'rgba(117, 117, 117, 0.15)' }
  },
  conceptLinkWrapperFlash: {
    '&:before': {
      animation: '$flashWrapper 3s'
    }
  },
  '@keyframes flashWrapper': {
    '0%': { borderRightColor: 'red' },
    '25%': { borderRightColor: 'red' },
    '100%': { borderRightColor: '#eaeaea' }
  }
}))

const CourseMapperView = ({ courseId, workspaceId, urlPrefix }) => {
  const classes = useStyles()
  const [focusedConceptIds, setFocusedConceptIds] = useState(new Set())
  const [courseTrayOpen, setCourseTrayOpen] = useState(false)
  const [addingLink, setAddingLink] = useState(null)
  const [flashingLink, setFlashingLink] = useState(null)
  const flashLinkTimeout = useRef(0)
  const [conceptLinkMenu, setConceptLinkMenu] = useState(null)
  const conceptLinkMenuRef = useRef()
  const conceptConnectionRef = useRef()
  const [{ loggedIn }] = useLoginStateValue()

  const flashLink = link => {
    if (focusedConceptIds.has(link.to.id) || focusedConceptIds.has(link.from.id)) {
      // Don't flash, link is active
      return
    }
    setFlashingLink(link.id)
    clearTimeout(flashLinkTimeout.current)
    flashLinkTimeout.current = setTimeout(() => setFlashingLink(null), 3000)
  }

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

  const updateCourse = useMutation(UPDATE_COURSE, {
    update: cache.updateCourseUpdate(workspaceId)
  })

  const handleMenuOpen = (event, linkId) => {
    event.preventDefault()
    setConceptLinkMenu({
      x: event.pageX + window.pageXOffset,
      y: event.pageY + 32 + window.pageYOffset,
      linkId
    })
  }

  const deleteConceptLink = useMutation(DELETE_CONCEPT_LINK, {
    update: cache.deleteConceptLinkUpdate(courseId, workspaceId)
  })

  const handleMenuClose = () => {
    setConceptLinkMenu(null)
  }

  const deleteLink = async () => {
    await deleteConceptLink({
      variables: {
        id: conceptLinkMenu.linkId
      }
    })
    setConceptLinkMenu(null)
  }

  const toggleFocus = id => {
    const newFocusedConceptIds = new Set(focusedConceptIds)
    if (newFocusedConceptIds.has(id)) {
      newFocusedConceptIds.delete(id)
    } else {
      newFocusedConceptIds.add(id)
    }
    setFocusedConceptIds(newFocusedConceptIds)
  }

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

  const showFab =
    (courseQuery.data.courseById && courseQuery.data.courseById.concepts.length !== 0) ||
    (workspaceQuery.data.workspaceById && workspaceQuery.data.workspaceById.courses.length > 1)

  const courseSet = new Set(prereqQuery.data.courseAndPrerequisites &&
    prereqQuery.data.courseAndPrerequisites.linksToCourse.map(link => link.from.id))

  return <>
    <div className={`${classes.root} ${courseTrayOpen ? classes.courseTrayOpen : ''}`}>
      <DividerWithText
        gridArea='traySpacer' content='Courses in workspace' hidden={!courseTrayOpen}
      />
      {
        showFab && loggedIn ?
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
          </Button> : null
      }
      <CourseTray
        activeCourseId={courseQuery.data.courseById.id}
        courseLinks={prereqQuery.data.courseAndPrerequisites.linksToCourse}
        courseTrayOpen={courseTrayOpen}
        courses={workspaceQuery.data.workspaceById.courses}
        workspaceId={workspaceQuery.data.workspaceById.id}
      />
      <PrerequisiteContainer
        courseLinks={prereqQuery.data.courseAndPrerequisites.linksToCourse}
        courseId={courseQuery.data.courseById.id}
        focusedConceptIds={focusedConceptIds}
        addingLink={addingLink}
        setAddingLink={setAddingLink}
        flashLink={flashLink}
        toggleFocus={toggleFocus}
        courseTrayOpen={courseTrayOpen}
        workspaceId={workspaceQuery.data.workspaceById.id}
        urlPrefix={urlPrefix}
      />
      <ActiveCourse
        onClick={() => setAddingLink(null)}
        course={courseQuery.data.courseById}
        courses={workspaceQuery.data.workspaceById.courses}
        updateCourse={updateCourse}
        focusedConceptIds={focusedConceptIds}
        addingLink={addingLink}
        setAddingLink={setAddingLink}
        flashLink={flashLink}
        toggleFocus={toggleFocus}
        courseTrayOpen={courseTrayOpen}
        workspaceId={workspaceQuery.data.workspaceById.id}
        urlPrefix={urlPrefix}
      />
    </div>
    {courseQuery.data.courseById && prereqQuery.data.courseAndPrerequisites
      && courseQuery.data.courseById.concepts.map((concept, cIdx) => (
        concept.linksToConcept.map((link, lIdx) => courseSet.has(link.from.course.id) &&
          <ConceptLink
            linkRef={(cIdx === 0 && lIdx === 0) ? conceptConnectionRef : undefined}
            key={`concept-link-${link.id}`} delay={1}
            active={flashingLink === link.id || (!addingLink && (
              focusedConceptIds.has(concept.id) || focusedConceptIds.has(link.from.id)
            ))}
            linkId={link.id}
            from={`concept-circle-active-${concept.id}`} to={`concept-circle-${link.from.id}`}
            fromAnchor='center middle' toAnchor='center middle' onContextMenu={handleMenuOpen}
            posOffsets={{ x0: -5, x1: +6 }}
            classes={flashingLink === link.id && !focusedConceptIds.has(concept.id)
              && !focusedConceptIds.has(link.from.id)
              ? {
                line: classes.conceptLinkFlash,
                wrapper: classes.conceptLinkWrapperFlash
              }
              : {}
            }
          />
        )
      ))
    }
    <div ref={conceptLinkMenuRef} style={{
      position: 'absolute',
      width: '1px',
      height: '1px',
      top: `${conceptLinkMenu ? conceptLinkMenu.y : -1}px`,
      left: `${conceptLinkMenu ? conceptLinkMenu.x : -1}px`
    }} />
    <Menu
      anchorEl={conceptLinkMenuRef.current}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'left'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left'
      }}
      open={Boolean(conceptLinkMenu) && Boolean(conceptLinkMenuRef.current)}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={deleteLink}>Delete link</MenuItem>
    </Menu>
    {addingLink && <ConceptLink
      key='concept-link-creating' active
      from={`${addingLink.type}-${addingLink.id}`} to={`${addingLink.type}-${addingLink.id}`}
      followMouse posOffsets={{ x0: addingLink.type === 'concept-circle-active' ? -7 : 7 }}
    />}
  </>
}

export default CourseMapperView
