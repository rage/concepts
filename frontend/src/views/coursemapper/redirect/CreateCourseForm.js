import React, { useState } from 'react'
import { useMutation } from '@apollo/react-hooks'
import { makeStyles } from '@material-ui/core/styles'
import { Container, Button, TextField, Typography, FormHelperText } from '@material-ui/core'

import { CREATE_COURSE } from '../../../graphql/Mutation'
import cache from '../../../apollo/update'
import useRouter from '../../../lib/useRouter'
import { noDefault } from '../../../lib/eventMiddleware'

const useStyles = makeStyles(theme => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(1)
  },
  list: {
    width: '100%',
    marginTop: theme.spacing(1)
  },
  submit: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2)
  }
}))

const CreateCourseForm = ({ workspaceId, urlPrefix }) => {
  const classes = useStyles()
  const { history } = useRouter()
  const [name, setName] = useState('')
  const [error, setError] = useState(false)

  const createCourse = useMutation(CREATE_COURSE, {
    update: cache.createCourseUpdate(workspaceId)
  })

  const createDefaultCourse = async () => {
    // Create course
    let courseRes
    try {
      courseRes = await createCourse({
        variables: {
          name: name.trim(),
          workspaceId
        }
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
      <div className={classes.paper}>
        <Typography component='h1' variant='h5'>
          Create course
        </Typography>

        <form className={classes.form} onSubmit={noDefault(createDefaultCourse)}>
          <TextField
            error={error}
            variant='outlined'
            margin='normal'
            required
            fullWidth
            label='Name of the course'
            name='name'
            autoComplete='name'
            onChange={(e) => setName(e.target.value)}
            value={name}
            autoFocus
          />
          <FormHelperText error={error}>
            { error ? 'Something went wrong' : null }
          </FormHelperText>
          <Button
            type='submit'
            fullWidth
            variant='contained'
            color='primary'
            className={classes.submit}
            disabled={name.trim().length === 0}
          >
            Create
          </Button>
        </form>
      </div>
    </Container>
  )
}

export default CreateCourseForm
