import React, { useState, useCallback } from 'react'
import { InputBase, MenuItem, Select } from '@material-ui/core'

import useRouter from '../../lib/useRouter'

const CourseList = ({ courseId, courses, urlPrefix, workspaceId }) => {
  const [open, setOpen] = useState(false)
  const { history } = useRouter()

  const onChange = useCallback(evt => {
    history.push(`${urlPrefix}/${workspaceId}/conceptmapper/${evt.target.value}`)
    setOpen(false)
  }, [history, urlPrefix, setOpen, workspaceId])

  const onClose = useCallback(() => setOpen(false), [setOpen])
  const onOpen = useCallback(() => setOpen(true), [setOpen])

  return (
    <Select
      open={open}
      value={courseId}
      onClose={onClose}
      onOpen={onOpen}
      input={<InputBase />}
      onChange={onChange}
    >
      {courses.map(course => <MenuItem key={course.id} value={course.id}>{course.name}</MenuItem>)}
    </Select>
  )
}

export default React.memo(CourseList)
