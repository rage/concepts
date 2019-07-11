import React, { useState } from 'react'
import { useMutation } from 'react-apollo-hooks'
import { UPDATE_COURSE } from '../../graphql/Mutation'
import { updateCourseUpdate } from '../../apollo/update'
import CourseEditingDialog from './CourseEditingDialog'

const useEditCourseDialog = (workspaceId) => {
  const [courseEditState, setCourseEditState] = useState({
    open: false,
    id: '',
    name: ''
  })

  const updateCourse = useMutation(UPDATE_COURSE, {
    update: updateCourseUpdate(workspaceId)
  })

  const handleCourseClose = () => {
    setCourseEditState({ open: false, id: '', name: '' })
  }

  const handleCourseOpen = (id, name) => () => {
    setCourseEditState({ open: true, id, name })
  }

  const dialog = (
    <CourseEditingDialog
      state={courseEditState}
      handleClose={handleCourseClose}
      updateCourse={updateCourse}
      defaultName={courseEditState.name}
    />
  )

  return {
    openEditCourseDialog: handleCourseOpen,
    CourseEditDialog: dialog
  }
}

export default useEditCourseDialog
