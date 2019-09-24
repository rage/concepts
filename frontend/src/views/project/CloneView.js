import React, { useState } from 'react'
import {
  List, ListItem, ListItemText, Typography, Button, Container, Paper, TextField, Divider
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { useQuery, useMutation } from 'react-apollo-hooks'

import { CLONE_TEMPLATE_WORKSPACE, USE_SHARE_LINK } from '../../graphql/Mutation'
import { PEEK_ACTIVE_TEMPLATE, WORKSPACE_BY_SOURCE_TEMPLATE } from '../../graphql/Query'
import { useMessageStateValue } from '../../store'
import NotFoundView from '../error/NotFoundView'
import LoadingBar from '../../components/LoadingBar'
import generateName from '../../lib/generateName'
import useRouter from '../../useRouter'

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  placeholder: {
    margin: theme.spacing(1, 0),
    textAlign: 'center'
  },
  wrapper: {
    position: 'relative',
    margin: theme.spacing(1)
  },
  button: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2)
  },
  paper: {
    margin: theme.spacing(2, 0)
  },
  listRoot: {
    padding: 0
  },
  progress: {
    margin: theme.spacing(2)
  }
}))

const CloneView = ({ token, peek, projectId }) => {
  const classes = useStyles()
  const { history } = useRouter()

  const [loading, setLoading] = useState(false)
  const [, messageDispatch] = useMessageStateValue()
  const [name, setName] = useState(generateName())

  const peekTemplate = useQuery(PEEK_ACTIVE_TEMPLATE, {
    skip: Boolean(token),
    variables: { id: projectId }
  })

  const workspace = useQuery(WORKSPACE_BY_SOURCE_TEMPLATE, {
    skip: Boolean(token) || !(peekTemplate.data?.limitedProjectById?.activeTemplateId),
    variables: {
      sourceId: peekTemplate.data?.limitedProjectById?.activeTemplateId
    }
  })

  const joinShareLink = useMutation(USE_SHARE_LINK)

  const cloneTemplate = useMutation(CLONE_TEMPLATE_WORKSPACE, {
    refetchQueries: !token ? [{
      query: WORKSPACE_BY_SOURCE_TEMPLATE,
      variables: {
        sourceId: peekTemplate.data?.limitedProjectById?.activeTemplateId
      }
    }] : []
  })

  const handleNavigateManager = (projectId, workspaceId) => {
    history.push(`/projects/${projectId}/workspaces/${workspaceId}/manager`)
  }

  const handleCreate = async () => {
    setLoading(true)
    if (peek) {
      try {
        const res = await joinShareLink({
          variables: { token }
        })
        projectId = res.data.useToken.project.id
      } catch (err) {
        messageDispatch({
          type: 'setError',
          message: err.message
        })
      }
    }
    const workspaceName = name.trim()
    if (workspaceName === '') {
      alert('Workspaces need a name!')
      return
    }
    try {
      const res = await cloneTemplate({
        variables: {
          projectId,
          name: workspaceName
        }
      })
      handleNavigateManager(projectId, res.data.cloneTemplateWorkspace.id)
    } catch (err) {
      messageDispatch({
        type: 'setError',
        message: err.message
      })
      setLoading(false)
    }
  }

  if (peekTemplate.loading) {
    return <LoadingBar id='clone-view' />
  } else if (peekTemplate.error) {
    return <NotFoundView message='Your share link is not valid' />
  }

  const peekData = peekTemplate.data ? peekTemplate.data.limitedProjectById
    : peek.data.peekShareLink

  const inputDisabled = Boolean(peekData && !peekData.activeTemplateId)
    || loading || Boolean(workspace.data?.workspaceBySourceTemplate?.id)

  return (
    <Container component='main' maxWidth='xs'>
      <form onSubmit={evt => {evt.preventDefault(); return handleCreate()}}>
        <TextField
          disabled={inputDisabled}
          variant='outlined'
          margin='normal'
          required
          fullWidth
          label='Workspace name'
          name='name'
          onChange={evt => setName(evt.target.value)}
          value={name}
          autoFocus
        />
        <Button
          fullWidth
          className={classes.button}
          variant='outlined'
          color='primary'
          type='submit'
          disabled={inputDisabled || name.length === 0}
        >
            Create workspace
        </Button>
      </form>
      <Divider />
      {
        workspace.data && workspace.data.workspaceBySourceTemplate ?
          <Paper className={classes.paper}>
            <List className={classes.listRoot}>
              <ListItem
                button key={workspace.data.workspaceBySourceTemplate.id}
                onClick={() => handleNavigateManager(
                  projectId, workspace.data.workspaceBySourceTemplate.id)}
              >
                <ListItemText
                  primary={
                    <Typography variant='h6'>
                      {workspace.data.workspaceBySourceTemplate.name}
                    </Typography>
                  }
                />
              </ListItem>
            </List>
          </Paper>
          :
          <div className={classes.placeholder}>
            <Typography variant='body1'>
                The clone of the project template will appear here.
            </Typography>
          </div>
      }
    </Container>
  )
}

export default CloneView
