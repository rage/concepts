import React, { useState } from 'react'
import Grid from '@material-ui/core/Grid'

import { useQuery, useMutation } from 'react-apollo-hooks'
import CircularProgress from '@material-ui/core/CircularProgress'

import { withStyles } from '@material-ui/core/styles'

import { FETCH_COURSE_AND_PREREQUISITES, WORKSPACE_BY_ID, ALL_COURSES } from '../../graphql/Query'
import { CREATE_COURSE, UPDATE_COURSE } from '../../graphql/Mutation'

import GuidedCourseContainer from './GuidedCourseContainer'
import GuidedCourseTray from './GuidedCourseTray'
import ActiveCourse from './ActiveCourse'

import Fab from '@material-ui/core/Fab'
// import AddIcon from '@material-ui/icons/Add'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'

import { useLoginStateValue } from '../../store'

const styles = theme => ({
})

const GuidedCourseView = ({ classes, courseId, workspaceId }) => {
  const [activeConceptIds, setActiveConceptIds] = useState([])
  const [courseTrayOpen, setCourseTrayOpen] = useState(false)
  const { loggedIn } = useLoginStateValue()[0]

  const workspaceQuery = useQuery(WORKSPACE_BY_ID, {
    variables: { id: workspaceId }
  })

  const courseQuery = useQuery(FETCH_COURSE_AND_PREREQUISITES, {
    variables: { courseId, workspaceId }
  })

  const createCourse = useMutation(CREATE_COURSE, {
    refetchQueries: [{
      query: ALL_COURSES,
      variables: {
        courseId, workspaceId
      }
    }]
  })

  const updateCourse = useMutation(UPDATE_COURSE, {
    refetchQueries: [{
      query: ALL_COURSES,
      variables: {
        courseId, workspaceId
      }
    }]
  })

  const toggleConcept = (id) => () => {
    const alreadyActive = activeConceptIds.find(i => i === id)
    setActiveConceptIds(alreadyActive ?
      activeConceptIds.filter(conceptId => conceptId !== id) :
      activeConceptIds.concat(id)
    )
  }

  const resetConceptToggle = () => {
    setActiveConceptIds([])
  }

  const handleTrayToggle = () => {
    setCourseTrayOpen(!courseTrayOpen)
  }

  return (
    <React.Fragment>
      {
        courseQuery.data.courseAndPrerequisites && workspaceQuery.data.workspaceById ?
          <Grid container spacing={0} direction="row">
            <ActiveCourse
              course={courseQuery.data.courseAndPrerequisites}
              activeConceptIds={activeConceptIds}
              toggleConcept={toggleConcept}
              resetConceptToggle={resetConceptToggle}
              courseTrayOpen={courseTrayOpen}
              workspaceId={workspaceQuery.data.workspaceById.id}
            />
            <GuidedCourseContainer
              courses={courseQuery.data.courseAndPrerequisites.linksToCourse.map(link => link.from)}
              courseId={courseQuery.data.courseAndPrerequisites.id}
              activeConceptIds={activeConceptIds}
              updateCourse={updateCourse}
              courseTrayOpen={courseTrayOpen}
              activeCourse={courseQuery.data.courseAndPrerequisites}
              setCourseTrayOpen={setCourseTrayOpen}
              workspaceId={workspaceQuery.data.workspaceById.id}
            />
            <GuidedCourseTray
              activeCourseId={courseQuery.data.courseAndPrerequisites.id}
              courseId={courseQuery.data.courseAndPrerequisites.id}
              courseLinks={courseQuery.data.courseAndPrerequisites.linksToCourse}
              setCourseTrayOpen={setCourseTrayOpen}
              courseTrayOpen={courseTrayOpen}
              createCourse={createCourse}
              workspaceId={workspaceQuery.data.workspaceById.id}
            />
            {
              courseQuery.data.courseAndPrerequisites.concepts.length !== 0 && loggedIn ?
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
            direction="row"
            justify="center"
            alignItems="center"
          >
            <Grid item xs={12}>
              <div style={{ textAlign: 'center' }}>
                <CircularProgress />
              </div>
            </Grid>
          </Grid>
      }
    </React.Fragment>
  )
}

export default withStyles(styles)(GuidedCourseView)