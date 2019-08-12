import React, { useState } from 'react'
import { withRouter } from 'react-router-dom'
import {
  List, ListItem, ListItemText, Typography, Button, Container, Paper, TextField,
  Divider, CircularProgress
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { useQuery, useMutation } from 'react-apollo-hooks'

import { CLONE_TEMPLATE_WORKSPACE } from '../../graphql/Mutation'
import { PEEK_ACTIVE_TEMPLATE, WORKSPACE_BY_SOURCE_TEMPLATE } from '../../graphql/Query'
import { useMessageStateValue } from '../../store'
import NotFoundView from '../error/NotFoundView'

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

const CloneView = ({ history, projectId }) => {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [, messageDispatch] = useMessageStateValue()

  const classes = useStyles()

  const peekTemplate = useQuery(PEEK_ACTIVE_TEMPLATE, {
    variables: { id: projectId }
  })

  const workspace = useQuery(WORKSPACE_BY_SOURCE_TEMPLATE, {
    skip: !(peekTemplate.data && peekTemplate.data.limitedProjectById &&
      peekTemplate.data.limitedProjectById.activeTemplateId),
    variables: {
      sourceId: (peekTemplate.data && peekTemplate.data.limitedProjectById) ?
        peekTemplate.data.limitedProjectById.activeTemplateId : undefined
    }
  })

  const cloneTemplate = useMutation(CLONE_TEMPLATE_WORKSPACE, {
    refetchQueries: [{
      query: WORKSPACE_BY_SOURCE_TEMPLATE, variables: {
        sourceId: (peekTemplate.data && peekTemplate.data.limitedProjectById) ?
          peekTemplate.data.limitedProjectById.activeTemplateId : undefined
      }
    }]
  })

  const handleNavigateMapper = (workspaceId) => {
    history.push(`/projects/${projectId}/workspaces/${workspaceId}/mapper`)
  }

  const handleCreate = async () => {
    const workspaceName = name.trim()
    if (workspaceName === '') {
      alert('Workspaces need a name!')
      return
    }
    setLoading(true)
    cloneTemplate({
      variables: {
        projectId,
        name: workspaceName
      }
    }).catch(err => {
      messageDispatch({
        type: 'setError',
        message: err.message
      })
    }).finally(() => {
      setLoading(false)
      setName('')
    })
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') {
      handleCreate(e)
    }
  }

  if (peekTemplate.loading) {
    return (
      <div style={{ textAlign: 'center' }}>
        <CircularProgress />
      </div>
    )
  } else if (peekTemplate.error) {
    return <NotFoundView message='Your share link is not valid' />
  }

  const inputDisabled = (peekTemplate.data.limitedProjectById &&
    !peekTemplate.data.limitedProjectById.activeTemplateId) ||
    loading ||
    (workspace.data && workspace.data.workspaceBySourceTemplate &&
      workspace.data.workspaceBySourceTemplate.id)

  return (
    <Container component='main' maxWidth='xs' cl>
      <TextField
        disabled={inputDisabled}
        variant='outlined'
        margin='normal'
        required
        fullWidth
        id='name'
        label='Workspace name'
        name='name'
        onChange={(e) => setName(e.target.value)}
        value={name}
        autoFocus
        onKeyPress={handleKey}
      />
      <Button
        fullWidth
        className={classes.button}
        variant='outlined'
        color='primary'
        onClick={handleCreate}
        disabled={!peekTemplate.data.limitedProjectById.activeTemplateId ||
            loading ||
            (workspace.data.workspaceBySourceTemplate &&
              workspace.data.workspaceBySourceTemplate.id)}
      >
          Create workspace
      </Button>
      <Divider />
      {
        workspace.data.workspaceBySourceTemplate ?
          <Paper className={classes.paper}>
            <List className={classes.listRoot}>
              <ListItem
                button key={workspace.data.workspaceBySourceTemplate.id}
                onClick={() => handleNavigateMapper(
                  workspace.data.workspaceBySourceTemplate.id)}
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

export default withRouter(CloneView)
