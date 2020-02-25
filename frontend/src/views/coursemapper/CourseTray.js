import React, { useMemo, useState } from 'react'
import { useMutation } from '@apollo/react-hooks'
import { makeStyles } from '@material-ui/core/styles'
import {
  Paper, List, ListItem, ListItemText, Checkbox, Button, Tooltip, TextField,
  ListItemSecondaryAction, IconButton, Menu, MenuItem
} from '@material-ui/core'
import {
  MoreVert as MoreVertIcon
} from '@material-ui/icons'

import { Role } from '../../lib/permissions'
import cache from '../../apollo/update'
import { CREATE_COURSE_LINK, DELETE_COURSE_LINK, DELETE_COURSE } from '../../graphql/Mutation'
import { useCreateCourseDialog, useEditCourseDialog } from '../../dialogs/course'
import { useMessageStateValue, useLoginStateValue } from '../../lib/store'
import { useInfoBox } from '../../components/InfoBox'
import useRouter from '../../lib/useRouter'
import { sortedCourses } from '../../lib/ordering'
import { useConfirmDelete } from '../../dialogs/alert'

const useStyles = makeStyles(theme => ({
  root: {
    padding: '16px',
    overflow: 'hidden',
    boxSizing: 'border-box',
    borderRadius: '0 0 4px 0',
    flexDirection: 'column',
    display: 'flex',
    gridArea: 'courseTray'
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

const PrerequisiteCourse = ({
  isPrerequisite,
  courseLinkMap,
  course,
  checkboxRef,
  activeCourseId,
  workspace,
  createCourseLink,
  deleteCourseLink,
  openEditCourseDialog,
  urlPrefix
}) => {
  const classes = useStyles()
  const { history } = useRouter()
  const confirmDelete = useConfirmDelete()

  const [, messageDispatch] = useMessageStateValue()
  const [{ user }] = useLoginStateValue()

  const [anchorEl, setAnchorEl] = useState(null)

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const deleteCourseMutation = useMutation(DELETE_COURSE, {
    update: cache.deleteCourseUpdate(workspace.id, activeCourseId)
  })

  const deleteCourse = async () => {
    if (!await confirmDelete('Are you sure you want to delete this course?')) {
      return
    }
    try {
      await deleteCourseMutation({
        variables: {
          id: course.id
        },
        optimisticResponse: {
          __typename: 'Mutation',
          deleteCourse: {
            __typename: 'Course',
            id: course.id
          }
        }
      })
      if (activeCourseId === course.id) {
        if (workspace.courses.length > 1) {
          const nextCourse = workspace.courses.find(c => c.id !== course.id)
          history.push(`${urlPrefix}/${workspace.id}/mapper/${nextCourse.id}`)
        } else {
          history.push(`${urlPrefix}/${workspace.id}/mapper`)
        }
      }
    } catch (ex) { }
  }

  const onClick = async () => {
    try {
      if (isPrerequisite) {
        await deleteCourseLink({
          variables: { id: courseLinkMap.get(course.id) }
        })
      } else {
        await createCourseLink({
          variables: { to: activeCourseId, from: course.id, workspaceId: workspace.id }
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
      <ListItem ref={checkboxRef} divider button onClick={onClick}>
        <ListItemText className={classes.courseName}>{course.name}</ListItemText>
        <ListItemSecondaryAction>
          <Checkbox checked={isPrerequisite} onClick={onClick} color='primary' />
          <IconButton
            aria-haspopup='true'
            onClick={handleMenuOpen}
            disabled={(course.frozen && user.role < Role.STAFF)}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={() => {
              handleMenuClose()
              openEditCourseDialog(course)
            }}>Edit</MenuItem>
            {!course.frozen && <MenuItem onClick={deleteCourse}>Delete</MenuItem>}
          </Menu>
        </ListItemSecondaryAction>
      </ListItem>
    </Tooltip>
  )
}

const CourseTray = ({ activeCourseId, workspace, courseLinks, urlPrefix }) => {
  const [filterKeyword, setFilterKeyword] = useState('')

  const classes = useStyles()
  const infoBox = useInfoBox()
  const [{ user }] = useLoginStateValue()

  const openEditCourseDialog = useEditCourseDialog(workspace.id, user.role >= Role.STAFF)
  const openCreateCourseDialog = useCreateCourseDialog(workspace.id, user.role >= Role.STAFF)

  const createCourseLink = useMutation(CREATE_COURSE_LINK, {
    update: cache.createCourseLinkUpdate(workspace.id)
  })

  const deleteCourseLink = useMutation(DELETE_COURSE_LINK, {
    update: cache.deleteCourseLinkUpdate(workspace.id)
  })

  const handleKeywordInput = (e) => {
    setFilterKeyword(e.target.value)
  }

  const filterKeywordLowercase = filterKeyword.toLowerCase()

  const orderedCourses = useMemo(() => sortedCourses(workspace.courses, workspace.courseOrder)
    .filter(course => course.name.toLowerCase().includes(filterKeywordLowercase)),
  [filterKeywordLowercase, workspace.courses, workspace.courseOrder])

  return (
    <Paper elevation={0} className={classes.root}>
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

      <List disablePadding className={classes.list}>
        {orderedCourses.map((course, index) =>
          <PrerequisiteCourse
            key={course.id}
            course={course}
            checkboxRef={index === 1 && infoBox.ref('mapper', 'ADD_COURSE_AS_PREREQ')}
            activeCourseId={activeCourseId}
            createCourseLink={createCourseLink}
            deleteCourseLink={deleteCourseLink}
            isPrerequisite={courseLinks.has(course.id)}
            courseLinkMap={courseLinks}
            openEditCourseDialog={openEditCourseDialog}
            workspace={workspace}
            urlPrefix={urlPrefix}
          />
        )}
      </List>
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
