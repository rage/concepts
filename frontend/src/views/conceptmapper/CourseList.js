import React, { useState, useRef, useCallback, useEffect } from 'react'
import { MenuItem, Select, FormControl, InputLabel } from '@material-ui/core'

import useRouter from '../../lib/useRouter'

const CourseList = ({ courseId, courses, urlPrefix, workspaceId, className, resetZoom }) => {
  const [open, setOpen] = useState(false)
  const { history } = useRouter()

  const inputLabel = useRef(null)
  const [labelWidth, setLabelWidth] = useState(0)
  useEffect(() => setLabelWidth(inputLabel.current.offsetWidth), [])

  const onChange = useCallback(evt => {
    history.push(`${urlPrefix}/${workspaceId}/conceptmapper/${evt.target.value}`)
    setOpen(false)
    resetZoom()
  }, [history, urlPrefix, setOpen, workspaceId])

  const onClose = useCallback(() => setOpen(false), [])
  const onOpen = useCallback(() => setOpen(true), [])

  return (
    <FormControl variant='outlined' margin='dense' className={className}>
      <InputLabel id='concept-mapper-course-select-label' ref={inputLabel}>Course</InputLabel>

      <Select
        labelId='concept-mapper-course-select-label'
        labelWidth={labelWidth}
        open={open}
        value={courseId}
        onClose={onClose}
        onOpen={onOpen}
        onChange={onChange}
      >
        {courses.map(course =>
          <MenuItem key={course.id} value={course.id}>{course.name}</MenuItem>
        )}
      </Select>
    </FormControl>
  )
}

export default React.memo(CourseList)
