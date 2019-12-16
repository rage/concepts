import { InputBase, MenuItem, Select } from '@material-ui/core'
import React, { useState } from 'react'

import useRouter from '../../lib/useRouter'

const CourseList = ({ course, courses, urlPrefix, workspaceId }) => {
  const [open, setOpen] = useState(false)
  const { history } = useRouter()

  return (
    <Select
      open={open}
      value={course.id}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      input={<InputBase />}
      onChange={evt => {
        history.push(`${urlPrefix}/${workspaceId}/conceptmapper/${evt.target.value}`)
        setOpen(false)
      }}
    >
      {courses.map(course =>
        <MenuItem key={course.id} value={course.id}>{course.name}</MenuItem>
      )}
    </Select>
  )
}

export default CourseList
