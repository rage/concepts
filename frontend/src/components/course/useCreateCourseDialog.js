import React, { useState } from 'react'
import { useMutation } from 'react-apollo-hooks'
import { CREATE_COURSE } from '../../graphql/Mutation'
import { createCourseUpdate } from '../../apollo/update'
import CourseCreationDialog from './CourseCreationDialog'

const useCreateCourseDialog = (workspaceId) => {
  const [state, setState] = useState({ open: false })

  const createCourse = useMutation(CREATE_COURSE, {
    update: createCourseUpdate(workspaceId)
  })

  const handleClose = () => {
    setState({ open: false })
  }

  const handleCourseOpen = () => {
    setState({ open: true })
  }

  const dialog = (
    <CourseCreationDialog
      state={state}
      handleClose={handleClose}
      workspaceId={workspaceId}
      createCourse={createCourse}
    />
  )

  return {
    openCreateCourseDialog: handleCourseOpen,
    CourseCreateDialog: dialog
  }
}

export default useCreateCourseDialog
