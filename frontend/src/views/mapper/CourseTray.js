import React, { useState, useEffect, useRef } from 'react'
import { useMutation, useApolloClient } from 'react-apollo-hooks'
import { makeStyles } from '@material-ui/core/styles'
import {
  Paper, Typography, List, ListItem, ListItemText, Checkbox, Button, Tooltip, TextField,
  ListItemSecondaryAction, IconButton, Menu, MenuItem
} from '@material-ui/core'
import {
  MoreVert as MoreVertIcon
} from '@material-ui/icons'


import { COURSE_PREREQUISITES, COURSES_BY_WORKSPACE } from '../../graphql/Query/Course'
import { CREATE_COURSE_LINK, DELETE_COURSE_LINK, DELETE_COURSE } from '../../graphql/Mutation'
import useCreateCourseDialog from '../../dialogs/course/useCreateCourseDialog'
import { useMessageStateValue } from '../../store'
import { useInfoBox } from '../../components/InfoBox'
import useEditCourseDialog from '../../dialogs/course/useEditCourseDialog'

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
    overflowWrap: 'break-word',
    maxWidth: 'calc(100% - 58px)'
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
  coursesAmount,
  checkboxRef,
  activeCourseId,
  workspaceId,
  createCourseLink,
  deleteCourseLink,
  openEditCourseDialog
}) => {
  const messageDispatch = useMessageStateValue()[1]
  const classes = useStyles()
  const [anchorEl, setAnchorEl] = useState(null)

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const deleteCourseMutation = useMutation(DELETE_COURSE, {
    refetchQueries: [{
      query: COURSES_BY_WORKSPACE,
      variables: {
        workspaceId
      }
    },
    {
      query: COURSE_PREREQUISITES,
      variables: {
        workspaceId,
        courseId: activeCourseId
      }
    }]
  })


  const deleteCourse = () => {
    try {
      if (coursesAmount > 1) {
        const willDelete = window.confirm('Are you sure you want to delete this course?')
        if (willDelete) {
          deleteCourseMutation({
            variables: {
              id: course.id
            }
          })
        }
      } else {
        messageDispatch({
          type: 'setError',
          data: 'The last course cannot be deleted'
        })
      }

    } catch (ex) {}
  }

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
      messageDispatch({
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
          <Checkbox checked={isPrerequisite} onClick={onClick} color='primary' />
          <IconButton
            aria-owns={anchorEl ? 'prerequisite-course-menu' : undefined}
            aria-haspopup='true'
            onClick={handleMenuOpen}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            id='prerequisite-course-menu'
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => {
              handleMenuClose()
              openEditCourseDialog(course.id, course.name)()
            }}>Edit</MenuItem>
            <MenuItem onClick={deleteCourse}>Delete</MenuItem>
          </Menu>
        </ListItemSecondaryAction>
      </ListItem>
    </Tooltip>
  )
}

const CourseTray = ({
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
    openEditCourseDialog, CourseEditDialog
  } = useEditCourseDialog(workspaceId)
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
        dataInStoreCopy.courseAndPrerequisites.linksToCourse = courseLinks
          .filter(course => course.id !== removedCourseLink.id)
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

  const getLinkToDelete = course => courseLinks.find(link => link.from.id === course.id)
  const isPrerequisite = course => getLinkToDelete(course) !== undefined

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
                openEditCourseDialog={openEditCourseDialog}
                coursesAmount={coursesQuery.data.coursesByWorkspace.length}
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
    </Paper>

    {CourseCreateDialog}
    {CourseEditDialog}
  </>
}

export default CourseTray
