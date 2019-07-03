import React, {useState, useEffect, useCallback} from 'react'
import Grid from '@material-ui/core/Grid'

import { useQuery, useMutation } from 'react-apollo-hooks'
import CircularProgress from '@material-ui/core/CircularProgress'

import { withStyles } from '@material-ui/core/styles'

import { WORKSPACE_BY_ID, COURSE_BY_ID, COURSE_PREREQUISITES } from '../../graphql/Query'
import { CREATE_COURSE, UPDATE_COURSE } from '../../graphql/Mutation'

import GuidedCourseContainer from './GuidedCourseContainer'
import GuidedCourseTray from './GuidedCourseTray'
import ActiveCourse from './ActiveCourse'

import Fab from '@material-ui/core/Fab'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'

import { useLoginStateValue } from '../../store'
import {
  createCourseUpdate,
  updateCourseUpdate
} from '../../apollo/update'
import LineTo from '../common/LineTo'
const styles = theme => ({
})

const GuidedCourseView = ({ classes, courseId, workspaceId }) => {
  const [activeConceptIds, setActiveConceptIds] = useState([])
  const [courseTrayOpen, setCourseTrayOpen] = useState(false)
  const [redrawLines, setRedrawLines] = useState(0)
  const [addingLink, setAddingLink] = useState(null)
  const { loggedIn } = useLoginStateValue()[0]

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
    setRedrawLines(redrawLines+1)
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
    <React.Fragment>
      {
        courseQuery.data.courseById && prereqQuery.data.courseAndPrerequisites && workspaceQuery.data.workspaceById ?
          <Grid id='course-view' container spacing={0} direction='row'>
            <ActiveCourse
              onClick={() => setAddingLink(null)}
              course={courseQuery.data.courseById}
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
              doRedrawLines={() => setRedrawLines(redrawLines+1)}
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
          </Grid>
          :
          <Grid container
            spacing={0}
            direction='row'
            justify='center'
            alignItems='center'
          >
            <Grid item xs={12}>
              <div style={{ textAlign: 'center' }}>
                <CircularProgress />
              </div>
            </Grid>
          </Grid>
      }
      {courseQuery.data.courseById && courseQuery.data.courseById.concepts.map(concept => (
        concept.linksToConcept.map(link => (
          <LineTo key={`concept-link-${link.id}`} within='course-view' delay={1}
            active={activeConceptIds.includes(concept.id)}
            from={`concept-circle-active-${concept.id}`} to={`concept-circle-${link.from.id}`}
            redrawLines={redrawLines} wrapperWidth={1} fromAnchor='right middle' toAnchor='left middle'/>
        ))
      ))}
      {addingLink && <LineTo key='concept-link-creating' within='course-view' active={true}
        from={`${addingLink.type}-${addingLink.id}`} to='root'
        followMouse={true}/>}
    </React.Fragment>
  )
}

export default withStyles(styles)(GuidedCourseView)
