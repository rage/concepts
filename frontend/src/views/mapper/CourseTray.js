import React, { useState } from 'react'
import { useMutation } from 'react-apollo-hooks'
import { makeStyles } from '@material-ui/core/styles'
import {
  Paper, List, ListItem, ListItemText, Checkbox, Button, Tooltip, TextField,
  ListItemSecondaryAction, IconButton, Menu, MenuItem
} from '@material-ui/core'
import {
  MoreVert as MoreVertIcon
} from '@material-ui/icons'
import { withRouter } from 'react-router-dom'

import cache from '../../apollo/update'
import { CREATE_COURSE_LINK, DELETE_COURSE_LINK, DELETE_COURSE } from '../../graphql/Mutation'
import { useCreateCourseDialog, useEditCourseDialog } from '../../dialogs/course'
import { useMessageStateValue, useLoginStateValue } from '../../store'
import { useInfoBox } from '../../components/InfoBox'

const useStyles = makeStyles(theme => ({
  root: {
    padding: '16px',
    overflow: 'hidden',
    boxSizing: 'border-box',
    borderRadius: '0 0 4px 0',
    flexDirection: 'column',
    display: 'none',
    '&$courseTrayOpen': {
      display: 'flex',
      gridArea: 'courseTray'
    }
  },
  courseTrayOpen: {},
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
    overflow: 'auto',
    flex: 1
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

const PrerequisiteCourse = withRouter(({
  isPrerequisite,
  getLinkToDelete,
  course,
  checkboxRef,
  activeCourseId,
  workspaceId,
  createCourseLink,
  deleteCourseLink,
  openEditCourseDialog,
  history,
  courses,
  urlPrefix
}) => {
  const messageDispatch = useMessageStateValue()[1]
  const classes = useStyles()
  const [anchorEl, setAnchorEl] = useState(null)
  const [{ user }] = useLoginStateValue()

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const deleteCourseMutation = useMutation(DELETE_COURSE, {
    update: cache.deleteCourseUpdate(workspaceId, activeCourseId)
  })

  const deleteCourse = () => {
    try {
      const willDelete = window.confirm('Are you sure you want to delete this course?')
      if (willDelete) {
        deleteCourseMutation({
          variables: {
            id: course.id
          }
        }).then(() => {
          if (activeCourseId === course.id) {
            if (courses.length > 1) {
              const nextCourse = courses.find(c => c.id !== course.id)
              history.push(`${urlPrefix}/${workspaceId}/mapper/${nextCourse.id}`)
            } else {
              history.push(`${urlPrefix}/${workspaceId}/mapper`)
            }
          }
        })
      }
    } catch (ex) { }
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
      setTimeout(() => window.dispatchEvent(new CustomEvent('redrawConceptLink')), 0)
    } catch (err) {
      messageDispatch({
        type: 'setError',
        data: 'Access denied'
      })
    }
  }
  return (
    <Tooltip title='Add course as prerequisite' enterDelay={500} leaveDelay={400} placement='right'>
      <ListItem
        ref={checkboxRef} divider button onClick={onClick}
      >
        <ListItemText className={classes.courseName}>{course.name}</ListItemText>
        <ListItemSecondaryAction>
          <Checkbox checked={isPrerequisite} onClick={onClick} color='primary' />
          <IconButton
            aria-haspopup='true'
            onClick={handleMenuOpen}
            disabled={(course.frozen && user.role !== 'STAFF')}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => {
              handleMenuClose()
              openEditCourseDialog(course.id, course.name, course.official,
                course.frozen, course.tags)
            }}>Edit</MenuItem>
            {!course.frozen && <MenuItem onClick={deleteCourse}>Delete</MenuItem>}
          </Menu>
        </ListItemSecondaryAction>
      </ListItem>
    </Tooltip>
  )
})

const CourseTray = ({
  courseTrayOpen,
  activeCourseId,
  workspaceId,
  courseLinks,
  courses,
  urlPrefix
}) => {
  const [filterKeyword, setFilterKeyword] = useState('')

  const classes = useStyles()
  const infoBox = useInfoBox()
  const [{ user }] = useLoginStateValue()

  const openEditCourseDialog = useEditCourseDialog(workspaceId, user.role === 'STAFF')
  const openCreateCourseDialog = useCreateCourseDialog(workspaceId, user.role === 'STAFF')

  const createCourseLink = useMutation(CREATE_COURSE_LINK, {
    update: cache.createCourseLinkUpdate(workspaceId, activeCourseId)
  })

  const deleteCourseLink = useMutation(DELETE_COURSE_LINK, {
    update: cache.deleteCourseLinkUpdate(workspaceId, activeCourseId)
  })

  const handleKeywordInput = (e) => {
    setFilterKeyword(e.target.value)
  }

  const getLinkToDelete = course => courseLinks.find(link => link.from.id === course.id)
  const isPrerequisite = course => getLinkToDelete(course) !== undefined

  const filterKeywordLowercase = filterKeyword.toLowerCase()

  return (
    <Paper
      elevation={0} className={`${classes.root} ${courseTrayOpen ? classes.courseTrayOpen : ''}`}
    >
      <TextField
        margin='dense'
        label='Filter'
        type='text'
        name='filter'
        fullWidth
        variant='outlined'
        className={classes.filterInput}
        value={filterKeyword}
        onChange={handleKeywordInput}
      />

      {
        courses &&
        <List disablePadding className={classes.list}>
          {courses
            .filter(course => course.name.toLowerCase().includes(filterKeywordLowercase))
            .map((course, index) =>
              <PrerequisiteCourse
                key={course.id}
                course={course}
                checkboxRef={index === 1 && infoBox.ref('mapper', 'ADD_COURSE_AS_PREREQ')}
                activeCourseId={activeCourseId}
                createCourseLink={createCourseLink}
                deleteCourseLink={deleteCourseLink}
                isPrerequisite={isPrerequisite(course)}
                getLinkToDelete={getLinkToDelete}
                workspaceId={workspaceId}
                openEditCourseDialog={openEditCourseDialog}
                courses={courses}
                urlPrefix={urlPrefix}
              />
            )
          }
        </List>
      }
      <Button
        ref={infoBox.ref('mapper', 'CREATE_COURSE')}
        onClick={openCreateCourseDialog}
        className={classes.button}
        variant='contained'
        color='secondary'
      >
        New course
      </Button>
    </Paper>
  )
}

export default CourseTray
