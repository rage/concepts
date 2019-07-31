import React, { useState } from 'react'
import { withRouter } from 'react-router-dom'
import { useMutation } from 'react-apollo-hooks'
import { withStyles } from '@material-ui/core/styles'
import {
  Container, CssBaseline, Button, TextField, Typography, FormHelperText
} from '@material-ui/core'

import { CREATE_COURSE } from '../../graphql/Mutation'
import { WORKSPACE_BY_ID } from '../../graphql/Query'
import client from '../../apollo/apolloClient'

const styles = theme => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1)
  },
  list: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1)
  },
  submit: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2)
  }
})

const WorkspaceDefaultCourseForm = ({ classes, workspaceId, history, urlPrefix }) => {
  const [name, setName] = useState('')
  const [error, setError] = useState(false)

  const createCourse = useMutation(CREATE_COURSE, {
    update: (store, response) => {
      try {
        const workspace = store.readQuery({
          query: WORKSPACE_BY_ID,
          variables: {
            id: workspaceId
          }
        })
        const createdCourse = response.data.createCourse
        workspace.workspaceById.courses.push(createdCourse)
        client.writeQuery({
          query: WORKSPACE_BY_ID,
          data: workspace
        })
      } catch (ex) {}
    }
  })

  const createDefaultCourse = async (e) => {
    e.preventDefault()
    if (name === '') {
      window.alert('Course needs a name!')
      return
    }

    // Create course
    let courseRes
    try {
      courseRes = await createCourse({
        variables: { name, workspaceId }
      })
    } catch (e) {
      setError(true)
      setTimeout(() => {
        setError(false)
      }, 4000)
      return
    }

    // Add course as default for the workspace
    try {
      const course = courseRes.data.createCourse
      history.replace(`${urlPrefix}/${workspaceId}/mapper/${course.id}`)
    } catch (e) {
      setError(true)
      setTimeout(() => {
        setError(false)
      }, 4000)
    }
  }

  return (
    <Container component='main' maxWidth='xs'>
      <CssBaseline />
      <div className={classes.paper}>
        <Typography component='h1' variant='h5'>
          Create course
        </Typography>

        <div className={classes.form}>
          <TextField
            error={error}
            variant='outlined'
            margin='normal'
            required
            fullWidth
            id='name'
            label='Name of the course'
            name='name'
            autoComplete='name'
            onChange={(e) => setName(e.target.value)}
            value={name}
            autoFocus
          />
          <FormHelperText error={error}>
            {
              error ?
                <span>
                  Something went wrong
                </span>
                : null
            }
          </FormHelperText>
          <Button
            type='submit'
            fullWidth
            variant='contained'
            color='primary'
            className={classes.submit}
            onClick={createDefaultCourse}
          >
            Create
          </Button>
        </div>
      </div>

    </Container>
  )
}

export default withRouter(withStyles(styles)(WorkspaceDefaultCourseForm))
