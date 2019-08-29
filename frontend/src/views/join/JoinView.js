import React, { useState } from 'react'
import { withRouter, Redirect } from 'react-router-dom'
import {
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button
} from '@material-ui/core'
import { useQuery, useMutation } from 'react-apollo-hooks'

import { USE_SHARE_LINK } from '../../graphql/Mutation'
import {
  WORKSPACES_FOR_USER, PEEK_SHARE_LINK, PEEK_SHARE_LINK_HACK, PROJECTS_FOR_USER
} from '../../graphql/Query'
import { useMessageStateValue, useLoginStateValue } from '../../store'
import CloneView from '../project/CloneView'
import LoadingBar from '../../components/LoadingBar'

const JoinView = ({ history, token }) => {
  const [loading, setLoading] = useState(false)
  const [{ user }] = useLoginStateValue()
  const [, messageDispatch] = useMessageStateValue()

  const type = token[0] === 'w' ? 'workspace' : 'project'
  const privilege = token[1] === 'c' ? 'clone' : 'other'

  const refetchQueries = type === 'workspace'
    ? [{ query: WORKSPACES_FOR_USER }]
    : (privilege !== 'clone'
      ? [{ query: PROJECTS_FOR_USER }]
      : [])

  const joinShareLink = useMutation(USE_SHARE_LINK, {
    refetchQueries
  })

  const peek = useQuery(privilege === 'clone' ? PEEK_SHARE_LINK_HACK : PEEK_SHARE_LINK, {
    variables: { token }
  })

  const handleClose = () => history.push('/')

  const handleCreate = () => {
    setLoading(true)
    joinShareLink({
      variables: { token }
    }).then(resp => {
      if (resp.data.useToken.privilege === 'CLONE' && type === 'project') {
        history.push(`/projects/${resp.data.useToken.project.id}/clone`)
      } else {
        history.push(type === 'workspace'
          ? `/workspaces/${resp.data.useToken.workspace.id}/manager`
          : `/projects/${resp.data.useToken.project.id}/overview`)
      }
    }).catch(() => {
      messageDispatch({
        type: 'setError',
        data: 'Access denied'
      })
      setLoading(false)
    })
  }

  const dialog = children => (
    <Dialog open onClose={handleClose}>
      <DialogTitle>Join {type}</DialogTitle>
      {children}
    </Dialog>
  )

  if (peek.loading) {
    return <LoadingBar id='join-view' />
  } else if (peek.error) {
    return dialog(
      <Dialog open onClose={handleClose}>
        <DialogTitle>{type[0].toUpperCase()}{type.slice(1)} not found</DialogTitle>
        <DialogContentText>
          Please ask for a new share link.
        </DialogContentText>
      </Dialog>
    )
  }

  const participant = peek.data.peekToken.participants.find(pcp => pcp.user.id === user.id)
  if (participant) {
    const path = type === 'workspace'
      ? `/workspaces/${peek.data.peekToken.id}/manager`
      : (privilege === 'clone'
        ? `/projects/${peek.data.peekToken.id}/clone`
        : `/projects/${peek.data.peekToken.id}/overview`)
    return <Redirect to={path} />
  } else if (privilege === 'clone') {
    return <CloneView token={token} peek={peek} />
  }

  return dialog(<>
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
  </>)
}

export default withRouter(JoinView)
