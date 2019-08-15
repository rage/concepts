import React, { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation } from 'react-apollo-hooks'
import CircularProgress from '@material-ui/core/CircularProgress'
import { makeStyles } from '@material-ui/core/styles'
import Fab from '@material-ui/core/Fab'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import MenuItem from '@material-ui/core/MenuItem'
import Menu from '@material-ui/core/Menu'

import {
  WORKSPACE_BY_ID, COURSE_BY_ID, COURSE_PREREQUISITES
} from '../../graphql/Query'
import { DELETE_CONCEPT_LINK, UPDATE_COURSE } from '../../graphql/Mutation'
import CourseContainer from './CourseContainer'
import CourseTray from './CourseTray'
import ActiveCourse from './ActiveCourse'
import { useLoginStateValue } from '../../store'
import cache from '../../apollo/update'
import { ConceptLink } from './concept'
import { useInfoBox } from '../../components/InfoBox'
import NotFoundView from '../error/NotFoundView'

const useStyles = makeStyles(() => ({
  root: {
    display: 'grid',
    // For some reason, this makes the 1fr sizing work without needing to hardcode heights of other
    // objects in the parent-level grid.
    overflow: 'hidden',
    gridTemplate: `"contentHeader activeHeader" 42px
                   "courses       activeCourse" 1fr
                   / 75%           25%`,
    '&.courseTrayOpen': {
      gridTemplateColumns: '50% 25%'
    },
    transition: 'grid-template-columns .15s linear',
    '@media screen and (max-width: 1299px)': {
      gridTemplateColumns: '66% 34%',
      '&.courseTrayOpen': {
        gridTemplateColumns: '50% 50%'
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

  const updateCourse = useMutation(UPDATE_COURSE, {
    update: cache.updateCourseUpdate(workspaceId)
  })

  useEffect(() => {
    const conceptsExist = courseQuery.data.courseById
      && courseQuery.data.courseById.concepts.length === 1
    const activeConceptHasLinks = courseQuery.data.courseById
      && courseQuery.data.courseById.concepts.find(concept => concept.linksToConcept.length > 0
        && focusedConceptIds.includes(concept.id))
    if (!courseTrayOpen && conceptsExist) {
      infoBox.open(trayFabRef.current, 'left-start', 'OPEN_COURSE_TRAY', 0, 50)
    }
    if (activeConceptHasLinks && focusedConceptIds.length > 0) {
      infoBox.open(conceptConnectionRef.current, 'right-start', 'DELETE_LINK', 0, 50)
    }
  }, [courseTrayOpen, focusedConceptIds, courseQuery])

  // Closes infoBox when leaving the page
  useEffect(() => infoBox.close, [])

  const handleMenuOpen = (event, link) => {
    event.preventDefault()
    setConceptLinkMenu({
      x: event.pageX + window.pageXOffset,
      y: event.pageY + 32 + window.pageYOffset,
      linkId: link.props.linkId
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
    setTimeout(() => window.dispatchEvent(new CustomEvent('redrawConceptLink')), 500)
  }

  if (workspaceQuery.error) {
    return <NotFoundView message='Workspace not found' />
  } else if (courseQuery.error) {
    return <NotFoundView message='Course not found' />
  }

  const showFab =
    (courseQuery.data.courseById && courseQuery.data.courseById.concepts.length !== 0) ||
    (workspaceQuery.data.workspaceById && workspaceQuery.data.workspaceById.courses.length > 1)

  return <>
    {
      !courseQuery.loading && !prereqQuery.loading && !workspaceQuery.loading ?
        <div
          id='course-view'
          className={`${classes.root} ${courseTrayOpen ? 'courseTrayOpen' : ''}`}
        >
          {/* <CourseTray
            activeCourseId={courseQuery.data.courseById.id}
            courseLinks={prereqQuery.data.courseAndPrerequisites.linksToCourse}
            courseTrayOpen={courseTrayOpen}
            courses={workspaceQuery.data.workspaceById.courses}
            workspaceId={workspaceQuery.data.workspaceById.id}
          /> */}
          <CourseContainer
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
          {
            showFab && loggedIn ?
              <Fab
                ref={trayFabRef}
                style={{ position: 'absolute', top: '68px', zIndex: '1', right: '20px' }}
                onClick={handleTrayToggle}
              >
                {
                  courseTrayOpen ?
                    <ChevronRightIcon />
                    :
                    <ChevronLeftIcon />
                }
              </Fab>
              : null
          }
        </div>
        :
        <div style={{ textAlign: 'center' }}>
          <CircularProgress />
        </div>
    }
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
              fromAnchor='right middle' toAnchor='left middle' onContextMenu={handleMenuOpen}
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
      key='concept-link-creating' active={true}
      from={`${addingLink.type}-${addingLink.id}`} to={`${addingLink.type}-${addingLink.id}`}
      followMouse={true} posOffsets={{ x0: addingLink.type === 'concept-circle-active' ? 7 : -7 }}
    />}
  </>
}

export default CourseMapperView
