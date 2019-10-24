import React, { useState, useRef, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Typography, Card, CardHeader, ListItemText, IconButton, ListItemSecondaryAction, Button,
  CircularProgress
} from '@material-ui/core'
import { Delete as DeleteIcon, Edit as EditIcon, Lock as LockIcon } from '@material-ui/icons'
import ReactDOM from 'react-dom'

import { Role } from '../../lib/permissions'
import { useLoginStateValue } from '../../lib/store'
import { noPropagation } from '../../lib/eventMiddleware'
import arrayShift from '../../lib/arrayShift'
import { DragHandle, SortableItem, SortableList } from '../../lib/sortableMoc'
import { backendToSelect } from '../../dialogs/tagSelectUtils'
import { useInfoBox } from '../../components/InfoBox'
import CourseEditor from './CourseEditor'

const useStyles = makeStyles(theme => ({
  root: {
    ...theme.mixins.gutters(),
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column'
  },
  list: {
    overflow: 'auto'
  },
  listItemActive: {
    boxShadow: `inset 3px 0px ${theme.palette.primary.dark}`
  },
  listItemDisabled: {
    color: 'rgba(0, 0, 0, 0.26)'
  },
  lockIcon: {
    visibility: 'hidden'
  },
  courseButton: {
    paddingRight: '128px',
    '&:hover $lockIcon': {
      visibility: 'visible'
    }
  },
  courseName: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
}))

const CourseList = ({
  workspace, setFocusedCourseId, focusedCourseId, updateWorkspace,
  createCourse, updateCourse, deleteCourse
}) => {
  const classes = useStyles()
  const infoBox = useInfoBox()
  const listRef = useRef()
  const [editing, setEditing] = useState(null)
  const [{ user }] = useLoginStateValue()
  const [orderedCourses, setOrderedCourses] = useState([])
  const [dirtyOrder, setDirtyOrder] = useState(null)

  useEffect(() => {
    if (!dirtyOrder) {
      const courses = workspace.courses.slice()
      setOrderedCourses(workspace.courseOrder
        .map(orderedId => {
          const index = courses.findIndex(course => course.id === orderedId)
          return index >= 0 ? courses.splice(index, 1)[0] : null
        })
        .filter(course => course !== null)
        .concat(courses))
    }
  }, [workspace.courses, workspace.courseOrder, dirtyOrder])

  const onSortEnd = ({ oldIndex, newIndex }) =>
    ReactDOM.unstable_batchedUpdates(() => {
      setOrderedCourses(items => arrayShift(items, oldIndex, newIndex))
      if (!dirtyOrder) setDirtyOrder('yes')
    })

  const saveOrder = async () => {
    setDirtyOrder('loading')
    await updateWorkspace({
      id: workspace.id,
      courseOrder: orderedCourses.map(course => course.id)
    })
    setDirtyOrder(null)
  }

  const isTemplate = Boolean(workspace.asTemplate?.id)
  const courseTags = backendToSelect(workspace.courseTags)

  return (
    <Card elevation={0} className={classes.root}>
      <CardHeader
        title='Courses'
        action={dirtyOrder ? <>
          <Button
            color='secondary' onClick={() => setDirtyOrder(null)}
            disabled={dirtyOrder === 'loading'} style={{ margin: '6px' }}
          >
            Reset
          </Button>
          <Button
            color='primary' onClick={saveOrder} disabled={dirtyOrder === 'loading'}
            style={{ margin: '6px' }}
          >
            {dirtyOrder === 'loading' ? <CircularProgress /> : 'Save'}
          </Button>
        </> : undefined}
      />
      <SortableList
        ref={listRef} className={classes.list} useDragHandle lockAxis='y'
        onSortEnd={onSortEnd}
      >
        {orderedCourses.map((course, index) => (
          <SortableItem
            className={course.id === focusedCourseId ? classes.listItemActive :
              editing && editing !== course.id ? classes.listItemDisabled : null}
            button={editing !== course.id}
            classes={{ button: classes.courseButton }}
            index={index}
            ref={index === 0 ? infoBox.ref('manager', 'FOCUS_COURSE') : undefined}
            key={course.id}
            onClick={() => editing !== course.id && setFocusedCourseId(course.id)}
          >
            {editing === course.id ? <CourseEditor
              submit={args => {
                setEditing(null)
                updateCourse({ id: course.id, ...args })
              }}
              cancel={() => setEditing(null)}
              defaultValues={course}
              tagOptions={courseTags}
              action='Save'
            /> : <>
              <ListItemText primary={
                <Typography className={classes.courseName} variant='h6'>{course.name}</Typography>
              } />
              <ListItemSecondaryAction>
                {course.frozen && user.role < Role.STAFF && (
                  <IconButton disabled classes={{ root: classes.lockIcon }}>
                    <LockIcon />
                  </IconButton>
                )}
                {!course.frozen &&
                  <IconButton
                    color={editing ? 'inherit' : undefined} aria-label='Delete' onClick={evt => {
                      evt.stopPropagation()
                      const msg = `Are you sure you want to delete the course ${course.name}?`
                      if (window.confirm(msg)) {
                        deleteCourse(course.id)
                      }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
                {(!course.frozen || user.role >= Role.STAFF) &&
                  <IconButton
                    color={editing ? 'inherit' : undefined} aria-label='Edit'
                    onClick={noPropagation(() => setEditing(course.id))}
                  >
                    <EditIcon />
                  </IconButton>
                }
                <DragHandle />
              </ListItemSecondaryAction>
            </>}
          </SortableItem>
        ))}
      </SortableList>
      <CourseEditor submit={async args => {
        await createCourse(args)
        if (listRef.current) {
          listRef.current.scrollTop = listRef.current.scrollHeight
        }
        infoBox.redrawIfOpen('manager',
          'CREATE_COURSE_NAME', 'CREATE_COURSE_THEMES', 'CREATE_COURSE_SUBMIT')
      }} defaultValues={{ official: isTemplate }} tagOptions={courseTags} />
    </Card>
  )
}

export default CourseList
