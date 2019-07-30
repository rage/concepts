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

  const type = token[0] === 'w' ? 'workspace' : 'project'
  const privilege = token[1] === 'c' ? 'clone' : 'other'

  const refetchQueries =
    type === 'workspace' ?
      [{ query: WORKSPACES_FOR_USER }]
      :
      (privilege !== 'clone' ? [{ query: PROJECTS_FOR_USER }] : [])

  const joinShareLink = useMutation(USE_SHARE_LINK, {
    refetchQueries
  })

  const peek = useQuery(PEEK_SHARE_LINK, {
    variables: { token }
  })

  const handleClose = () => history.push('/user')

  const handleCreate = () => {
    setLoading(true)
    joinShareLink({
      variables: { token }
    }).then(resp => {
      if (resp.data.useToken.privilege === 'CLONE' && type === 'project') {
        history.push(`/projects/${resp.data.useToken.project.id}/clone`)
      } else {
        history.push(type === 'workspace'
          ? `/workspaces/${resp.data.useToken.workspace.id}/mapper`
          : `/projects/${resp.data.useToken.project.id}`)
      }
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
      const path = type === 'workspace'
        ? `/workspaces/${peek.data.peekToken.id}/mapper`
        : (privilege === 'clone'
          ? `/projects/${peek.data.peekToken.id}/clone`
          : `/projects/${peek.data.peekToken.id}`)
      return <Redirect to={path} />
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
        <DialogContent style={{ textAlign: 'center' }}>
          <CircularProgress />
        </DialogContent>
      )}
    </Dialog>
  )
}

export default withRouter(JoinView)
