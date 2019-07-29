import React, { useState } from 'react'
import { withRouter } from 'react-router-dom'
import {
  List, ListItem, ListItemText, Card, CardHeader, Typography, Button
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { useQuery, useMutation } from 'react-apollo-hooks'

import { CLONE_TEMPLATE_WORKSPACE } from '../../graphql/Mutation'
import { PEEK_ACTIVE_TEMPLATE, WORKSPACE_BY_SOURCE_TEMPLATE } from '../../graphql/Query'
import { useMessageStateValue, useLoginStateValue } from '../../store'

const useStyles = makeStyles(theme => ({
  root: {
    ...theme.mixins.gutters(),
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    boxSizing: 'border-box',
    overflow: 'visible'
  },
  progress: {
    margin: theme.spacing(2)
  }
}))

const CloneView = ({ history, projectId }) => {
  const [loading, setLoading] = useState(false)
  const [{ user }] = useLoginStateValue()
  const [, messageDispatch] = useMessageStateValue()

  const classes = useStyles()

  const peekTemplate = useQuery(PEEK_ACTIVE_TEMPLATE, {
    variables: { id: projectId }
  })

  const workspace = useQuery(WORKSPACE_BY_SOURCE_TEMPLATE, {
    skip: !(peekTemplate.data && peekTemplate.data.projectById &&
      peekTemplate.data.projectById.activeTemplate.id)
    ,
    variables: {
      sourceId: (peekTemplate.data && peekTemplate.data.projectById) ?
        peekTemplate.data.projectById.activeTemplate.id : undefined
    }
  })

  const cloneTemplate = useMutation(CLONE_TEMPLATE_WORKSPACE, {
    refetchQueries: [{
      query: WORKSPACE_BY_SOURCE_TEMPLATE, variables: {
        sourceId: (peekTemplate.data && peekTemplate.data.projectById) ?
          peekTemplate.data.projectById.activeTemplate.id : undefined
      }
    }]
  })

  const handleNavigateMapper = (workspaceId) => {
    history.push(`/workspaces/${workspaceId}/mapper`)
  }

  const handleClose = () => history.push('/user')

  const handleCreate = async () => {
    setLoading(true)
    cloneTemplate({
      variables: {
        sourceTemplateId: (peekTemplate.data && peekTemplate.data.projectById) ?
          peekTemplate.data.projectById.activeTemplate.id : undefined,
        projectId,
        name: 'TEST'
      }
    }).catch(err => {
      messageDispatch({
        type: 'setError',
        message: err.message
      })
    })
    setLoading(false)
  }

  return (
    peekTemplate.data.projectById ?
      <Card elevation={0} className={classes.root}>
        <CardHeader
          action={
            <Button variant='outlined' color='primary'
              disabled={!peekTemplate.data.projectById.activeTemplate.id}
              aria-label='Invite students' onClick={handleCreate}
            >
              Create workspace
            </Button>
          }
          title='Cloned workspace'
        />
        {
          workspace.data.workspaceBySourceTemplate ?
            <List>
              <ListItem
                button key={workspace.id} onClick={() => handleNavigateMapper(workspace.id)}
              >
                <ListItemText
                  primary={
                    <Typography variant='h6'>
                      {workspace.name}
                    </Typography>
                  }
                />
              </ListItem>
            </List>
            :
            null
        }
      </Card>
      :
      null
  )
}

export default withRouter(CloneView)
