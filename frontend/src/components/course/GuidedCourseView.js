import React, { useState, useEffect, useRef } from 'react'
import Grid from '@material-ui/core/Grid'

import { useQuery, useMutation } from 'react-apollo-hooks'
import CircularProgress from '@material-ui/core/CircularProgress'

import { withStyles } from '@material-ui/core/styles'

import { WORKSPACE_BY_ID, COURSE_BY_ID, COURSE_PREREQUISITES } from '../../graphql/Query'
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

const styles = theme => ({
  root: {
    display: 'grid',
    // The topbar is 48px + 10px margin
    // TODO remove when switching whole app to CSS grid
    height: 'calc(100vh - 58px)',
    width: '100%',
    gridTemplateAreas:
      `"activeCourse contentHeader contentHeader"
       "activeCourse courses       courses"`,
    gridTemplateColumns: '25% auto 25%',
    gridTemplateRows: '64px calc(100vh - 58px - 64px)',
    '&.courseTrayOpen': {
      gridTemplateAreas:
        `"activeCourse contentHeader courseTray"
         "activeCourse courses       courseTray"`
    },
    '@media screen and (max-width: 1000px)': {
      gridTemplateColumns: '32% auto 32%'
    }
  }
})

const GuidedCourseView = ({ classes, courseId, workspaceId }) => {
  const [activeConceptIds, setActiveConceptIds] = useState([])
  const [courseTrayOpen, setCourseTrayOpen] = useState(false)
  const [redrawLines, setRedrawLines] = useState(0)
  const [addingLink, setAddingLink] = useState(null)
  const [conceptLinkMenu, setConceptLinkMenu] = useState(null)
  const conceptLinkMenuRef = useRef()
  const { loggedIn } = useLoginStateValue()[0]

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
    setConceptLinkMenu(null)
  }

  const workspaceQuery = useQuery(WORKSPACE_BY_ID, {
    variables: { id: workspaceId }
  })

  const prereqQuery = useQuery(COURSE_PREREQUISITES, {
    variables: { courseId, workspaceId }
  })

  const courseQuery = useQuery(COURSE_BY_ID, {
    variables: { id: courseId }
  })

  const createCourse = useMutation(CREATE_COURSE, {
    update: createCourseUpdate(workspaceId)
  })

  const updateCourse = useMutation(UPDATE_COURSE, {
    update: updateCourseUpdate(workspaceId)
  })

  useEffect(() => {
    setRedrawLines(redrawLines + 1)
  }, [workspaceQuery, prereqQuery, courseQuery])

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
              workspaceId={workspaceQuery.data.workspaceById.id}
            />
            <GuidedCourseContainer
              onClick={() => setAddingLink(null)}
              courses={prereqQuery.data.courseAndPrerequisites.linksToCourse.map(link => link.from)}
              courseId={courseQuery.data.courseById.id}
              activeConceptIds={activeConceptIds}
              addingLink={addingLink}
              setAddingLink={setAddingLink}
              doRedrawLines={() => setRedrawLines(redrawLines + 1)}
              updateCourse={updateCourse}
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
              workspaceId={workspaceQuery.data.workspaceById.id}
            />
            {
              courseQuery.data.courseById.concepts.length !== 0 && loggedIn ?
                <Fab
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
        && courseQuery.data.courseById.concepts.map(concept => (
          prereqQuery.data.courseAndPrerequisites.linksToCourse
            .filter(link => link.from.id === concept.courses[0].id)
            ? concept.linksToConcept.map(link => (
              <ConceptLink
                key={`concept-link-${link.id}`} within='course-view' delay={1}
                active={!addingLink && activeConceptIds.includes(concept.id)} linkId={link.id}
                from={`concept-circle-active-${concept.id}`} to={`concept-circle-${link.from.id}`}
                redrawLines={redrawLines} fromAnchor='right middle' toAnchor='left middle'
                onContextMenu={handleMenuOpen} posOffsets={{ x0: -5, x1: +6 }} />
            )) : null
        ))}
      <div ref={conceptLinkMenuRef} style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        display: conceptLinkMenu ? 'block' : 'none',
        top: `${conceptLinkMenu ? conceptLinkMenu.y : 0}px`,
        left: `${conceptLinkMenu ? conceptLinkMenu.x : 0}px`
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
        key='concept-link-creating' within='course-view' active={true}
        from={`${addingLink.type}-${addingLink.id}`} to={`${addingLink.type}-${addingLink.id}`}
        followMouse={true} posOffsets={{ x0: addingLink.type === 'concept-circle-active' ? 7 : -7 }}
      />}
    </>
  )
}

export default withStyles(styles)(GuidedCourseView)
