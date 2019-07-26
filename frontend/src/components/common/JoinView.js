import React, { useState } from 'react'
import { withRouter, Redirect } from 'react-router-dom'

import {
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, CircularProgress
} from '@material-ui/core'

import { useQuery, useMutation } from 'react-apollo-hooks'
import { USE_SHARE_LINK } from '../../graphql/Mutation'
import { WORKSPACES_FOR_USER, PEEK_SHARE_LINK, PROJECTS_FOR_USER } from '../../graphql/Query'
import { useMessageStateValue, useLoginStateValue } from '../../store'

const JoinView = ({ history, token }) => {
  const [loading, setLoading] = useState(false)
  const [{ user }] = useLoginStateValue()
  const [, messageDispatch] = useMessageStateValue()

  const joinShareLink = useMutation(USE_SHARE_LINK, {
    refetchQueries: [{
      query: PROJECTS_FOR_USER
    }, {
      query: WORKSPACES_FOR_USER
    }]
  })

  const type = token[0] === 'w' ? 'workspace' : 'project'

  const peek = useQuery(PEEK_SHARE_LINK, {
    variables: { token }
  })

  const handleClose = () => history.push('/user')

  const handleCreate = () => {
    setLoading(true)
    joinShareLink({
      variables: { token }
    }).then(resp => {
      history.push(type === 'workspace'
        ? `/workspaces/${resp.data.useToken.workspace.id}/mapper`
        : `/projects/${resp.data.useToken.project.id}`)
    }).catch(() => {
      messageDispatch({
        type: 'setError',
        data: 'Access denied'
      })
      setLoading(false)
    })
  }

  if (peek.data.peekToken) {
    const participant = peek.data.peekToken.participants.find(pcp => pcp.user.id === user.id)
    if (participant) {
      return <Redirect to={type === 'workspace'
        ? `/workspaces/${peek.data.peekToken.id}/mapper`
        : `/projects/${peek.data.peekToken.id}`} />
    }
  }

  return (
    <Dialog open onClose={handleClose}>
      <DialogTitle>Join {type}</DialogTitle>
      {peek.data.peekToken ? <>
        <DialogContent>
          <DialogContentText>
            You have been invited to the {type} {peek.data.peekToken.name}.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color='primary'>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={loading} color='primary'>
            Join
          </Button>
        </DialogActions>
      </> : (
        <DialogContent>
          <DialogContentText style={{ textAlign: 'center' }}>
            <CircularProgress />
          </DialogContentText>
        </DialogContent>
      )}
    </Dialog>
  )
}

export default withRouter(JoinView)
