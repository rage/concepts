import React, { useState, useEffect, useRef } from 'react'

import { useQuery, useMutation } from 'react-apollo-hooks'
import CircularProgress from '@material-ui/core/CircularProgress'

import { makeStyles } from '@material-ui/core/styles'

import {
  WORKSPACE_BY_ID, COURSE_BY_ID, COURSE_PREREQUISITES, COURSES_BY_WORKSPACE
} from '../../graphql/Query'
import { CREATE_COURSE, DELETE_CONCEPT_LINK, UPDATE_COURSE } from '../../graphql/Mutation'

import GuidedCourseContainer from './GuidedCourseContainer'
import GuidedCourseTray from './GuidedCourseTray'
import ActiveCourse from './ActiveCourse'

import Fab from '@material-ui/core/Fab'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'

import { useLoginStateValue } from '../../store'
import {
  createCourseUpdate, deleteConceptLinkUpdate,
  updateCourseUpdate
} from '../../apollo/update'
import ConceptLink from '../concept/ConceptLink'
import MenuItem from '@material-ui/core/MenuItem'
import Menu from '@material-ui/core/Menu'

import { useInfoBox } from '../common/InfoBox'

const useStyles = makeStyles(() => ({
  root: {
    display: 'grid',
    // For some reason, this makes the 1fr sizing work without needing to hardcode heights of other
    // objects in the parent-level grid.
    overflow: 'hidden',
    gridTemplate: `"activeCourse contentHeader contentHeader" 64px
                   "activeCourse courses       courses"       1fr
                   / 25% auto 25%`,
    '&.courseTrayOpen': {
      gridTemplateAreas:
        `"activeCourse contentHeader courseTray"
         "activeCourse courses       courseTray"`
    },
    '@media screen and (max-width: 1000px)': {
      gridTemplateColumns: '32% auto 32%'
    }
  }
}))

const GuidedCourseView = ({ courseId, workspaceId }) => {
  const classes = useStyles()
  const [activeConceptIds, setActiveConceptIds] = useState([])
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

  const coursesQuery = useQuery(COURSES_BY_WORKSPACE, {
    variables: { workspaceId }
  })

  const createCourse = useMutation(CREATE_COURSE, {
    update: createCourseUpdate(workspaceId)
  })

  const updateCourse = useMutation(UPDATE_COURSE, {
    update: updateCourseUpdate(workspaceId)
  })

  useEffect(() => {
    const conceptsExist = courseQuery.data.courseById
      && courseQuery.data.courseById.concepts.length === 1
    const activeConceptHasLinks = courseQuery.data.courseById
      && courseQuery.data.courseById.concepts.find(concept => {
        return concept.linksToConcept.length > 0
          && activeConceptIds.includes(concept.id)
      })
    if (!courseTrayOpen && conceptsExist) {
      infoBox.open(trayFabRef.current, 'left-start', 'OPEN_COURSE_TRAY', 0, 50)
    }
    if (activeConceptHasLinks && activeConceptIds.length > 0) {
      infoBox.open(conceptConnectionRef.current, 'right-start', 'DELETE_LINK', 0, 50)
    }
  }, [courseTrayOpen, activeConceptIds, courseQuery])

  // Closes infoBox when leaving the page
  useEffect(() => {
    return infoBox.close
  }, [])

  const handleMenuOpen = (event, link) => {
    event.preventDefault()
    setConceptLinkMenu({
      x: event.pageX + window.pageXOffset,
      y: event.pageY + 32 + window.pageYOffset,
      linkId: link.props.linkId
    })
  }

  const deleteConceptLink = useMutation(DELETE_CONCEPT_LINK, {
    update: deleteConceptLinkUpdate(courseId, workspaceId)
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

  const toggleConcept = (id) => () => {
    const alreadyActive = activeConceptIds.find(i => i === id)
    setActiveConceptIds(alreadyActive ?
      activeConceptIds.filter(conceptId => conceptId !== id) :
      activeConceptIds.concat(id)
    )
  }

  const handleTrayToggle = () => {
    setCourseTrayOpen(!courseTrayOpen)
  }

  return (
    <>
      {
        courseQuery.data.courseById && prereqQuery.data.courseAndPrerequisites
          && workspaceQuery.data.workspaceById ?
          <div
            id='course-view'
            className={`${classes.root} ${courseTrayOpen ? 'courseTrayOpen' : ''}`}
          >
            <ActiveCourse
              onClick={() => setAddingLink(null)}
              course={courseQuery.data.courseById}
              updateCourse={updateCourse}
              activeConceptIds={activeConceptIds}
              addingLink={addingLink}
              setAddingLink={setAddingLink}
              toggleConcept={toggleConcept}
              courseTrayOpen={courseTrayOpen}
              courseLinks={prereqQuery.data.courseAndPrerequisites.linksToCourse}
              workspaceId={workspaceQuery.data.workspaceById.id}
            />
            <GuidedCourseContainer
              courses={prereqQuery.data.courseAndPrerequisites.linksToCourse.map(link => link.from)}
              courseLinks={prereqQuery.data.courseAndPrerequisites.linksToCourse}
              courseId={courseQuery.data.courseById.id}
              activeConceptIds={activeConceptIds}
              addingLink={addingLink}
              setAddingLink={setAddingLink}
              courseTrayOpen={courseTrayOpen}
              activeCourse={courseQuery.data.courseById}
              setCourseTrayOpen={setCourseTrayOpen}
              workspaceId={workspaceQuery.data.workspaceById.id}
            />
            <GuidedCourseTray
              activeCourseId={courseQuery.data.courseById.id}
              courseId={courseQuery.data.courseById.id}
              courseLinks={prereqQuery.data.courseAndPrerequisites.linksToCourse}
              setCourseTrayOpen={setCourseTrayOpen}
              courseTrayOpen={courseTrayOpen}
              createCourse={createCourse}
              coursesQuery={coursesQuery}
              workspaceId={workspaceQuery.data.workspaceById.id}
            />
            {
              courseQuery.data.courseById.concepts.length !== 0 && loggedIn ?
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
                active={!addingLink && activeConceptIds.includes(concept.id)} linkId={link.id}
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
  )
}

export default GuidedCourseView
