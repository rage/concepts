import React, { useState } from 'react'
import { useMutation } from '@apollo/react-hooks'
import { Card, CardHeader, List } from '@material-ui/core'

import { CREATE_COURSE, DELETE_COURSE, UPDATE_COURSE } from '../../graphql/Mutation'
import cache from '../../apollo/update'
import CourseEditor from '../manager/CourseEditor'
import { CourseItem } from './CourseItem'
import { useStyles } from './styles'

export const Courses = ({ workspaceId, courses, onToggleCourse, tagOptions, onClickCircle }) => {
  const classes = useStyles()
  const [editing, setEditing] = useState()

  const [createCourse] = useMutation(CREATE_COURSE, {
    update: cache.createCourseUpdate(workspaceId)
  })
  const [updateCourse] = useMutation(UPDATE_COURSE, {
    update: cache.updateCourseUpdate(workspaceId)
  })
  const [deleteCourse] = useMutation(DELETE_COURSE, {
    update: cache.deleteCourseUpdate(workspaceId)
  })

  return (
    <Card elevation={0} className={`${classes.card} ${classes.courses}`}>
      <CardHeader title='Courses' className={classes.cardHeader} />
      <List className={classes.list}>
        {courses.map(course => editing === course.id ? (
          <CourseEditor
            submit={args => {
              setEditing(null)
              return updateCourse({ variables: args })
            }}
            tagOptions={tagOptions}
            cancel={() => setEditing(null)}
            defaultValues={course}
            action='Save'
            key={course.id}
          />
        ) : (
          <CourseItem
            onToggleCourse={onToggleCourse}
            deleteCourse={id => deleteCourse({ variables: { id } })} editing={editing}
            key={course.id} course={course} setEditing={setEditing} onClickCircle={onClickCircle}
          />
        ))}
      </List>
      <CourseEditor
        className={classes.formWithMask} tagOptions={tagOptions}
        submit={args => createCourse({
          variables: {
            workspaceId,
            ...args
          }
        })}
      />
    </Card>
  )
}
