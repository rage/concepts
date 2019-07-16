import React, { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useApolloClient } from 'react-apollo-hooks'
import { makeStyles } from '@material-ui/core/styles'

import {
  Paper, Typography, List, ListItem, ListItemText, Checkbox, Button, Tooltip, TextField,
  ListItemSecondaryAction
} from '@material-ui/core'
import { COURSES_BY_WORKSPACE, COURSE_PREREQUISITES } from '../../graphql/Query/Course'

import { CREATE_COURSE_LINK, DELETE_COURSE_LINK } from '../../graphql/Mutation'

import useCreateCourseDialog from './useCreateCourseDialog'

import { useErrorStateValue } from '../../store'

import { useInfoBox } from '../common/InfoBox'

const useStyles = makeStyles(theme => ({
  root: {
    gridArea: 'courseTray',
    display: 'flex',
    flexDirection: 'column',
    padding: '16px',
    boxSizing: 'border-box'
  },
  title: {
    paddingBottom: '0px',
    maxWidth: 'calc(100% - 64px)',
    overflowWrap: 'break-word',
    hyphens: 'auto',
    marginBottom: '16px'
  },
  filterInput: {
    paddingBottom: '16px'
  },
  list: {
    backgroundColor: theme.palette.background.paper,
    overflow: 'auto'
  },
  courseName: {
    overflowWrap: 'break-word'
  },
  button: {
    marginTop: '16px',
    width: '100%'
  }
}))

const PrerequisiteCourse = ({
  isPrerequisite,
  getLinkToDelete,
  course,
  checkboxRef,
  activeCourseId,
  workspaceId,
  createCourseLink,
  deleteCourseLink
}) => {
  const errorDispatch = useErrorStateValue()[1]
  const classes = useStyles()

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
      <ListItem ref={checkboxRef} divider button onClick={onClick} className={classes.listItem}>
        <ListItemText className={classes.courseName}>{course.name}</ListItemText>
        <ListItemSecondaryAction>
          <Checkbox checked={isPrerequisite} onClick={onClick} color='primary'></Checkbox>
        </ListItemSecondaryAction>
      </ListItem>
    </Tooltip>
  )
}

const GuidedCourseTray = ({
  courseTrayOpen,
  activeCourseId,
  courseId,
  workspaceId,
  courseLinks,
  coursesQuery
}) => {
  const [filterKeyword, setFilterKeyword] = useState('')

  const classes = useStyles()

  const infoBox = useInfoBox()

  const createButtonRef = useRef()

  const checkboxRef = useRef()

  const {
    openCreateCourseDialog,
    CourseCreateDialog
  } = useCreateCourseDialog(workspaceId)

  const client = useApolloClient()

  useEffect(() => {
    const courses = coursesQuery.data.coursesByWorkspace
      && coursesQuery.data.coursesByWorkspace
    const enoughCourses = courses && courses.length === 1
    if (courseTrayOpen && enoughCourses) {
      infoBox.open(createButtonRef.current, 'left-start', 'CREATE_COURSE', 0, 50)
    } else if (courseTrayOpen && courses.length > 1 && courseLinks.length === 0) {
      infoBox.open(checkboxRef.current, 'left-start', 'ADD_COURSE_AS_PREREQ', 0, 50)
    }
  }, [courseTrayOpen, coursesQuery, courseLinks])

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

  const isPrerequisite = (course) => {
    return (courseLinks.find(link => link.from.id === course.id) !== undefined)
  }

  const getLinkToDelete = (course) => {
    return courseLinks.find(link => link.from.id === course.id)
  }

  const filterKeywordLowercase = filterKeyword.toLowerCase()

  if (!courseTrayOpen) {
    return null
  }

  return <>
    <Paper elevation={0} className={classes.root}>
      <Typography className={classes.title} variant='h4'>
        Courses in workspace
      </Typography>

      <TextField
        margin='dense'
        id='description'
        label='Filter'
        type='text'
        name='filter'
        fullWidth
        variant='outlined'
        className={classes.filterInput}
        value={filterKeyword}
        onChange={handleKeywordInput}
      />

      {coursesQuery.data.coursesByWorkspace &&
        <List disablePadding className={classes.list}>
          {coursesQuery.data.coursesByWorkspace
            .filter(course => course.name.toLowerCase().includes(filterKeywordLowercase))
            .map((course, index) =>
              <PrerequisiteCourse
                key={course.id}
                course={course}
                checkboxRef={index === 1 && checkboxRef}
                activeCourseId={activeCourseId}
                createCourseLink={createCourseLink}
                deleteCourseLink={deleteCourseLink}
                isPrerequisite={isPrerequisite(course)}
                getLinkToDelete={getLinkToDelete}
                workspaceId={workspaceId}
              />
            )
          }
        </List>
      }

      <Button
        ref={createButtonRef}
        onClick={openCreateCourseDialog}
        className={classes.button}
        variant='contained'
        color='secondary'
      >
        New course
      </Button>
    </Paper >

    {CourseCreateDialog}
  </>
}

export default GuidedCourseTray
