import React, { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
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
    '&.courseTrayOpen': {
      gridTemplateColumns: '3fr 64px 7fr 3fr'
    },
    '@media screen and (max-width: 1999px)': {
      gridTemplateColumns: '0 64px 6fr 3fr',
      '&.courseTrayOpen': {
        gridTemplateColumns: '3fr 64px 5fr 3fr'
      }
    },
    '@media screen and (max-width: 1499px)': {
      gridTemplateColumns: '0 64px 4fr 3fr',
      '&.courseTrayOpen': {
        gridTemplateColumns: '3fr 64px 3fr 3fr'
      }
    }
  }
}))

const CourseMapperView = ({ courseId, workspaceId, urlPrefix }) => {
  const classes = useStyles()
  const [focusedConceptIds, setFocusedConceptIds] = useState([])
  const [courseTrayOpen, setCourseTrayOpen] = useState(false)
  const [addingLink, setAddingLink] = useState(null)
  const [conceptLinkMenu, setConceptLinkMenu] = useState(null)
  const conceptLinkMenuRef = useRef()
  const trayFabRef = useRef()
  const conceptConnectionRef = useRef()
  const [{ loggedIn }] = useLoginStateValue()

  const infoBox = useInfoBox()

  const workspaceQuery = useQuery(WORKSPACE_BY_ID, {
    variables: { id: workspaceId }
  })

  const prereqQuery = useQuery(COURSE_PREREQUISITES, {
    variables: { courseId, workspaceId }
  })

  const courseQuery = useQuery(COURSE_BY_ID, {
    variables: { id: courseId }
  })

  const [updateCourse] = useMutation(UPDATE_COURSE, {
    update: cache.updateCourseUpdate(workspaceId)
  })

  useEffect(() => {
    if (!courseQuery.data) {
      return
    }
    const conceptsExist = courseQuery.data.courseById
      && courseQuery.data.courseById.concepts.length === 1
    const activeConceptHasLinks = courseQuery.data.courseById
      && courseQuery.data.courseById.concepts.find(concept => concept.linksToConcept.length > 0
        && focusedConceptIds.includes(concept.id))
    if (!courseTrayOpen && conceptsExist) {
      infoBox.open(trayFabRef.current, 'right-start', 'OPEN_COURSE_TRAY', 0, 50)
    }
    if (activeConceptHasLinks && focusedConceptIds.length > 0) {
      infoBox.open(conceptConnectionRef.current, 'right-start', 'DELETE_LINK', 0, 50)
    }
  }, [courseTrayOpen, focusedConceptIds, courseQuery])

  // Closes infoBox when leaving the page
  useEffect(() => infoBox.close, [])

  const handleMenuOpen = (event, linkId) => {
    event.preventDefault()
    setConceptLinkMenu({
      x: event.pageX + window.pageXOffset,
      y: event.pageY + 32 + window.pageYOffset,
      linkId
    })
  }

  const [deleteConceptLink] = useMutation(DELETE_CONCEPT_LINK, {
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
    infoBox.close()
    setConceptLinkMenu(null)
  }

  const toggleFocus = id => {
    const currentlyFocused = focusedConceptIds.includes(id)
    setFocusedConceptIds(currentlyFocused ?
      focusedConceptIds.filter(conceptId => conceptId !== id) :
      focusedConceptIds.concat(id)
    )
  }

  const handleTrayToggle = () => {
    setCourseTrayOpen(!courseTrayOpen)
    setTimeout(() => window.dispatchEvent(new CustomEvent('redrawConceptLink')), 0)
  }

  if (workspaceQuery.error) {
    return <NotFoundView message='Workspace not found' />
  } else if (courseQuery.error) {
    return <NotFoundView message='Course not found' />
  } else if (prereqQuery.loading || courseQuery.loading || workspaceQuery.loading) {
    return <LoadingBar id='course-view' />
  }

  const showFab =
    (courseQuery.data.courseById && courseQuery.data.courseById.concepts.length !== 0) ||
    (workspaceQuery.data.workspaceById && workspaceQuery.data.workspaceById.courses.length > 1)

  return <>
    <div
      id='course-view'
      className={`${classes.root} ${courseTrayOpen ? 'courseTrayOpen' : ''}`}
    >
      <DividerWithText
        gridArea='traySpacer' content='Courses in workspace' hidden={!courseTrayOpen}
      />
      {
        showFab && loggedIn ?
          <Button
            ref={trayFabRef}
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
        courses={prereqQuery.data.courseAndPrerequisites.linksToCourse.map(link => link.from)}
        courseLinks={prereqQuery.data.courseAndPrerequisites.linksToCourse}
        courseId={courseQuery.data.courseById.id}
        focusedConceptIds={focusedConceptIds}
        addingLink={addingLink}
        setAddingLink={setAddingLink}
        toggleFocus={toggleFocus}
        courseTrayOpen={courseTrayOpen}
        activeCourse={courseQuery.data.courseById}
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
        toggleFocus={toggleFocus}
        courseTrayOpen={courseTrayOpen}
        courseLinks={prereqQuery.data.courseAndPrerequisites.linksToCourse}
        workspaceId={workspaceQuery.data.workspaceById.id}
        urlPrefix={urlPrefix}
      />
    </div>
    {courseQuery.data.courseById && prereqQuery.data.courseAndPrerequisites
      && courseQuery.data.courseById.concepts.map((concept, cIdx) => (
        prereqQuery.data.courseAndPrerequisites.linksToCourse
          .filter(link => link.from.id === concept.courses[0].id)
          ? concept.linksToConcept.map((link, lIdx) => (
            <ConceptLink
              linkRef={(cIdx === 0 && lIdx === 0) ? conceptConnectionRef : undefined}
              key={`concept-link-${link.id}`} delay={1}
              active={!addingLink && (
                focusedConceptIds.includes(concept.id) || focusedConceptIds.includes(link.from.id)
              )}
              linkId={link.id}
              from={`concept-circle-active-${concept.id}`} to={`concept-circle-${link.from.id}`}
              fromAnchor='center middle' toAnchor='center middle' onContextMenu={handleMenuOpen}
              posOffsets={{ x0: -5, x1: +6 }} />
          )) : null
      ))}
    <div ref={conceptLinkMenuRef} style={{
      position: 'absolute',
      width: '1px',
      height: '1px',
      top: `${conceptLinkMenu ? conceptLinkMenu.y : -1}px`,
      left: `${conceptLinkMenu ? conceptLinkMenu.x : -1}px`
    }} />
    <Menu
      id='concept-link-menu'
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
