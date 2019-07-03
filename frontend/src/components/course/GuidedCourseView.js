import React, {useState, useEffect, useCallback} from "react"
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
// import AddIcon from '@material-ui/icons/Add'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'

import { useLoginStateValue } from '../../store'
import {
  createCourseUpdate,
  updateCourseUpdate
} from '../../apollo/update'
import Tooltip from "@material-ui/core/Tooltip"
import LineTo from "../common/LineTo"
const styles = theme => ({
})

const debounce = (fn, delay) => {
  let lastTime = Date.now()
  let timeout = null
  return (...args) => {
    if (lastTime + delay < Date.now()) {
      if (timeout !== null) {
        clearTimeout(timeout)
        timeout = null
      }
      fn(...args)
      lastTime = Date.now()
    } else {
      timeout = setTimeout(() => {
        fn(...args)
        clearTimeout(timeout)
      })
    }
  }
}

const GuidedCourseView = ({ classes, courseId, workspaceId }) => {
  const [activeConceptIds, setActiveConceptIds] = useState([])
  const [courseTrayOpen, setCourseTrayOpen] = useState(false)
  const [redrawLines, setRedrawLines] = useState(0)
  const [conceptCircles, setConceptCircles] = useState({})
  const { loggedIn } = useLoginStateValue()[0]
  const [width, setWidth] = useState(window.innerWidth)

  useEffect(() => {
    const handleResize = debounce(() => setWidth(window.innerWidth), 100)

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    }
  }, [])

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

  const conceptCircleRef = useCallback(node => {
    if (node !== null) {
      const box = node.getBoundingClientRect()
      conceptCircles[node.id] = {
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
      }
    }
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

  const resetConceptToggle = () => {
    setActiveConceptIds([])
  }

  const handleTrayToggle = () => {
    setCourseTrayOpen(!courseTrayOpen)
  }

  return (
    <React.Fragment>
      {
        courseQuery.data.courseById && prereqQuery.data.courseAndPrerequisites && workspaceQuery.data.workspaceById ?
          <Grid container spacing={0} direction="row">
            <ActiveCourse
              course={courseQuery.data.courseById}
              activeConceptIds={activeConceptIds}
              conceptCircleRef={conceptCircleRef}
              toggleConcept={toggleConcept}
              resetConceptToggle={resetConceptToggle}
              courseTrayOpen={courseTrayOpen}
              workspaceId={workspaceQuery.data.workspaceById.id}
            />
            <GuidedCourseContainer
              courses={prereqQuery.data.courseAndPrerequisites.linksToCourse.map(link => link.from)}
              courseId={courseQuery.data.courseById.id}
              activeConceptIds={activeConceptIds}
              conceptCircleRef={conceptCircleRef}
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
      {courseQuery.data.courseById && courseQuery.data.courseById.concepts.map(concept => (
        concept.linksToConcept.map(link => (
          <LineTo key={`concept-link-${concept.id}-${link.from.id}`} within="App" delay={1}
                  active={activeConceptIds.includes(concept.id)}
                  from={conceptCircles[`concept-circle-active-${concept.id}`]} to={conceptCircles[`concept-circle-${link.from.id}`]}
                  redrawLines={redrawLines} wrapperWidth={1} fromAnchor="right middle" toAnchor="left middle"/>
        ))
      ))}
    </React.Fragment>
  )
}

export default withStyles(styles)(GuidedCourseView)
