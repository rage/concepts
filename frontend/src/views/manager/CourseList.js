import React, { useState, useRef, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Card, CardHeader, Button, CircularProgress } from '@material-ui/core'
import ReactDOM from 'react-dom'

import { useLoginStateValue } from '../../lib/store'
import arrayShift from '../../lib/arrayShift'
import { SortableList } from '../../lib/sortableMoc'
import { backendToSelect } from '../../dialogs/tagSelectUtils'
import { useInfoBox } from '../../components/InfoBox'
import CourseEditor from './CourseEditor'
import CourseListItem from './CourseListItem'
import { sortedCourses } from '../../lib/ordering'

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
      setOrderedCourses(sortedCourses(workspace.courses, workspace.courseOrder))
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
          <CourseListItem
            course={course} user={user} index={index} editing={editing} setEditing={setEditing}
            focusedCourseId={focusedCourseId} setFocusedCourseId={setFocusedCourseId}
            updateCourse={updateCourse} deleteCourse={deleteCourse} courseTags={courseTags}
            key={course.id}
          />
        ))}
      </SortableList>
      <CourseEditor submit={async args => {
        await createCourse(args)
        if (listRef.current?.node) {
          listRef.current.node.scrollTop = listRef.current.node.scrollHeight
        }
        infoBox.redrawIfOpen('manager',
          'CREATE_COURSE_NAME', 'CREATE_COURSE_THEMES', 'CREATE_COURSE_SUBMIT')
      }} defaultValues={{ official: isTemplate }} tagOptions={courseTags} />
    </Card>
  )
}

export default CourseList
