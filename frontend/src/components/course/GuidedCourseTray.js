import React, { useState } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'

// Card
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'

// List
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Checkbox from '@material-ui/core/Checkbox'
import Button from '@material-ui/core/Button'
import Tooltip from '@material-ui/core/Tooltip'
import TextField from '@material-ui/core/TextField'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'

import CourseCreationDialog from './CourseCreationDialog'
import { useQuery, useMutation, useApolloClient } from 'react-apollo-hooks'
import { COURSES_BY_WORKSPACE, COURSE_PREREQUISITES } from '../../graphql/Query/Course'
import { CREATE_COURSE_LINK, DELETE_COURSE_LINK } from '../../graphql/Mutation'

// Error dispatcher
import { useErrorStateValue } from '../../store'

const styles = theme => ({
  root: {
    height: '90vh'
  },
  courseName: {
    maxWidth: '80%',
    overflowWrap: 'break-word',
    hyphens: 'auto'
  },
  cardHeader: {
    paddingBottom: '0px'
  },
  headerContent: {
    maxWidth: '100%'
  },
  title: {
    overflowWrap: 'break-word',
    hyphens: 'auto'
  },
  list: {
    backgroundColor: theme.palette.background.paper,
    width: '100%',
    overflow: 'auto',
    maxHeight: '73vh',
    padding: 0
  },
  listItem: {
    width: '100%',
    backgroundColor: '#fff',
    '&:focus': {
      backgroundColor: '#fff'
    }
  },
  button: {
    width: '100%'
  }
})

const PrerequisiteCourse = ({
  classes,
  isPrerequisite,
  getLinkToDelete,
  course,
  activeCourseId,
  workspaceId,
  createCourseLink,
  deleteCourseLink
}) => {
  const errorDispatch = useErrorStateValue()[1]

  const onClick = async () => {
    try {
      if (isPrerequisite) {
        const link = getLinkToDelete(course)
        await deleteCourseLink({
          variables: { id: link.id }
        })
      } else {
        await createCourseLink({
          variables: { to: activeCourseId, from: course.id, workspaceId: workspaceId }
        })
      }
    } catch (err) {
      errorDispatch({
        type: 'setError',
        data: 'Access denied'
      })
    }
  }
  return (
    <Tooltip title='Add course as prerequisite' enterDelay={500} leaveDelay={400} placement='right'>
      <ListItem divider button onClick={onClick} className={classes.listItem}>
        <ListItemText className={classes.courseName}>{course.name}</ListItemText>
        <ListItemSecondaryAction>
          <Checkbox checked={isPrerequisite} onClick={onClick} color='primary'></Checkbox>
        </ListItemSecondaryAction>
      </ListItem>
    </Tooltip>
  )
}

const GuidedCourseTray = ({
  classes,
  courseTrayOpen,
  activeCourseId,
  courseId,
  workspaceId,
  courseLinks,
  createCourse
}) => {
  const [state, setState] = useState({ open: false })
  const [filterKeyword, setFilterKeyword] = useState('')

  const coursesQuery = useQuery(COURSES_BY_WORKSPACE, {
    variables: { workspaceId }
  })

  const client = useApolloClient()

  const includedIn = (set, object) =>
    set.map(p => p.id).includes(object.id)

  const createCourseLink = useMutation(CREATE_COURSE_LINK, {
    update: (store, response) => {
      const dataInStore = store.readQuery({
        query: COURSE_PREREQUISITES,
        variables: { courseId, workspaceId }
      })
      const addedCourseLink = response.data.createCourseLink
      const dataInStoreCopy = { ...dataInStore }
      const courseLinks = dataInStoreCopy.courseAndPrerequisites.linksToCourse
      if (!includedIn(courseLinks, addedCourseLink)) {
        courseLinks.push(addedCourseLink)
        client.writeQuery({
          query: COURSE_PREREQUISITES,
          variables: { courseId, workspaceId },
          data: dataInStoreCopy
        })
      }
    }
  })

  const deleteCourseLink = useMutation(DELETE_COURSE_LINK, {
    update: (store, response) => {
      const dataInStore = store.readQuery({
        query: COURSE_PREREQUISITES,
        variables: { courseId, workspaceId }
      })
      const removedCourseLink = response.data.deleteCourseLink
      const dataInStoreCopy = { ...dataInStore }
      const courseLinks = dataInStoreCopy.courseAndPrerequisites.linksToCourse
      if (includedIn(courseLinks, removedCourseLink)) {
        dataInStoreCopy.courseAndPrerequisites.linksToCourse = courseLinks.filter(course => {
          return course.id !== removedCourseLink.id
        })
        client.writeQuery({
          query: COURSE_PREREQUISITES,
          variables: { courseId, workspaceId },
          data: dataInStoreCopy
        })
      }
    }
  })

  const handleKeywordInput = (e) => {
    setFilterKeyword(e.target.value)
  }

  const handleClose = () => {
    setState({ open: false })
  }

  const handleClickOpen = () => {
    setState({ open: true })
  }

  const isPrerequisite = (course) => {
    return (courseLinks.find(link => link.from.id === course.id) !== undefined)
  }

  const getLinkToDelete = (course) => {
    return courseLinks.find(link => link.from.id === course.id)
  }

  return (
    <React.Fragment >
      {
        courseTrayOpen ?
          <Grid item xs={4} lg={3}>
            <Card elevation={0} className={classes.root}>
              <CardHeader
                className={classes.cardHeader}
                classes={{ title: classes.title, content: classes.headerContent }}
                title='Courses in workspace'
                titleTypographyProps={{ variant: 'h4' }}
              />

              <CardContent>
                <TextField
                  margin='dense'
                  id='description'
                  label='Filter'
                  type='text'
                  name='filter'
                  fullWidth
                  value={filterKeyword}
                  onChange={handleKeywordInput}
                />

                {
                  coursesQuery.data.coursesByWorkspace ?
                    <List disablePadding className={classes.list}>
                      {
                        coursesQuery.data.coursesByWorkspace
                          .filter(course => {
                            return course.name.toLowerCase().includes(filterKeyword.toLowerCase())
                          })
                          .map(course =>
                            <PrerequisiteCourse
                              key={course.id}
                              course={course}
                              activeCourseId={activeCourseId}
                              createCourseLink={createCourseLink}
                              deleteCourseLink={deleteCourseLink}
                              isPrerequisite={isPrerequisite(course)}
                              getLinkToDelete={getLinkToDelete}
                              classes={classes}
                              workspaceId={workspaceId}
                            />
                          )
                      }
                    </List>
                    :
                    null
                }
                <Button
                  onClick={handleClickOpen}
                  className={classes.button}
                  variant='contained'
                  color='secondary'
                >
                  New course
                </Button>
              </CardContent>
            </Card >
            <CourseCreationDialog
              state={state}
              handleClose={handleClose}
              workspaceId={workspaceId}
              createCourse={createCourse}
            />
          </Grid >
          :
          null
      }
    </React.Fragment >
  )
}

export default withStyles(styles)(GuidedCourseTray)
