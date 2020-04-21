import React, { useState, useRef, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Card, CardHeader, Button, CircularProgress, Typography, TextField, MenuItem
} from '@material-ui/core'
import ReactDOM from 'react-dom'

import { useLoginStateValue } from '../../lib/store'
import arrayShift from '../../lib/arrayShift'
import { SortableList } from '../../lib/sortableMoc'
import { Role } from '../../lib/permissions'
import { backendToSelect } from '../../dialogs/tagSelectUtils'
import { useInfoBox } from '../../components/InfoBox'
import CourseEditor from './CourseEditor'
import CourseListItem from './CourseListItem'
import { sortedItems } from '../../lib/ordering'
import search from './search'

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
  filterBar: {
    display: 'flex',
    marginBottom: '8px'
  },
  filterText: {
    flex: 1
  },
  sortSelect: {
    marginLeft: '8px'
  }
}))

const sortingOptions = {
  ALPHA_ASC: 'Alphabetical (A-Z)',
  ALPHA_DESC: 'Alphabetical (Z-A)',
  CREATION_ASC: 'Creation date (oldest first)',
  CREATION_DESC: 'Creation date (newest first)',
  TOPO_ASC: 'Topological',
  CUSTOM: 'Custom'
}

const CourseList = ({
  workspace, setFocusedCourseId, focusedCourseId, updateWorkspace,
  createCourse, updateCourse, deleteCourse
}) => {
  const classes = useStyles()
  const infoBox = useInfoBox()
  const listRef = useRef()
  const [editing, setEditing] = useState(null)
  const [{ user }] = useLoginStateValue()
  const [courseFilter, setCourseFilter] = useState('')

  const order = workspace.courseOrder
  const isOrdered = order?.length === 1 && order[0].startsWith('__ORDER_BY__')
  const defaultOrderMethod = isOrdered ? order[0].substr('__ORDER_BY__'.length) : 'CUSTOM'
  const [orderedCourses, setOrderedCourses] = useState([])
  const [orderMethod, setOrderMethod] = useState(defaultOrderMethod)
  const [dirtyOrder, setDirtyOrder] = useState(null)

  useEffect(() => {
    if (!dirtyOrder && defaultOrderMethod !== orderMethod) {
      setOrderMethod(defaultOrderMethod)
    }
    if (!dirtyOrder || orderMethod !== 'CUSTOM') {
      setOrderedCourses(sortedItems(workspace.courses, order, orderMethod))
    }
  }, [workspace.courses, workspace.courses.length, order, dirtyOrder, orderMethod])

  const onSortEnd = ({ oldIndex, newIndex }) =>
    oldIndex !== newIndex && ReactDOM.unstable_batchedUpdates(() => {
      setOrderedCourses(items => arrayShift(items, oldIndex, newIndex))
      if (!dirtyOrder) setDirtyOrder('yes')
      if (orderMethod !== 'CUSTOM') setOrderMethod('CUSTOM')
    })

  const resetOrder = () => {
    setDirtyOrder(null)
    setOrderMethod(defaultOrderMethod)
  }

  const saveOrder = async () => {
    setDirtyOrder('loading')
    await updateWorkspace({
      id: workspace.id,
      courseOrder: orderMethod === 'CUSTOM'
        ? orderedCourses.map(course => course.id)
        : [`__ORDER_BY__${orderMethod}`]
    })
    setDirtyOrder(null)
  }

  const isTemplate = Boolean(workspace.asTemplate?.id)
  const courseTags = backendToSelect(workspace.courseTags)

  const conceptFilterParsed = search.parse(courseFilter)
  const includeCourse = course => search.include(course, conceptFilterParsed)

  return (
    <Card elevation={0} className={classes.root}>
      <CardHeader
        title='Courses'
        className={classes.header}
        action={dirtyOrder ? <>
          <Button
            color='secondary' onClick={resetOrder} disabled={dirtyOrder === 'loading'}
            style={{ margin: '6px' }}
          >
            Reset
          </Button>
          <Button
            color='primary' onClick={saveOrder} disabled={dirtyOrder === 'loading'}
            style={{ margin: '6px' }}
          >
            {dirtyOrder === 'loading' ? <CircularProgress /> : 'Save'}
          </Button>
        </> : user.role >= Role.STAFF && <>
          <Button
            color='primary' onClick={() => setFocusedCourseId('common')} style={{ margin: '6px' }}
            disabled={focusedCourseId === 'common'}
          >
            View common concepts
          </Button>
        </>}
      />

      <div className={classes.filterBar}>
        <TextField
          variant='outlined'
          margin='dense'
          label='Filter courses'
          value={courseFilter}
          onChange={evt => setCourseFilter(evt.target.value)}
          className={classes.filterText}
        />
        <TextField
          select
          variant='outlined'
          margin='dense'
          label='Sort by'
          value={orderMethod}
          onChange={evt => {
            setOrderMethod(evt.target.value)
            setDirtyOrder(true)
          }}
          className={classes.sortSelect}
        >
          {Object.entries(sortingOptions).map(([key, label]) =>
            <MenuItem key={key} value={key}>{label}</MenuItem>
          )}
        </TextField>
      </div>

      {orderedCourses.length === 0 ? (
        <Typography variant='h6' align='center' gutterBottom color='textSecondary'>
          Add new courses below
        </Typography>
      ) : (
        <SortableList
          ref={listRef} className={classes.list} useDragHandle lockAxis='y'
          onSortEnd={onSortEnd}
        >
          {orderedCourses.map((course, index) => includeCourse(course) && (
            <CourseListItem
              course={course} user={user} index={index} editing={editing} setEditing={setEditing}
              focusedCourseId={focusedCourseId} setFocusedCourseId={setFocusedCourseId}
              updateCourse={updateCourse} deleteCourse={deleteCourse} courseTags={courseTags}
              key={course.id}
            />
          ))}
        </SortableList>
      )}
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
