import React, { useState } from 'react'
import { withRouter, Redirect } from 'react-router-dom'

import {
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, CircularProgress
} from '@material-ui/core'

import { useQuery, useMutation } from 'react-apollo-hooks'
import { USE_SHARE_LINK } from '../../graphql/Mutation'
import { WORKSPACES_FOR_USER, PEEK_SHARE_LINK } from '../../graphql/Query'
import { useMessageStateValue, useLoginStateValue } from '../../store'

const JoinView = ({ history, token }) => {
  const [loading, setLoading] = useState(false)
  const [{ user }] = useLoginStateValue()
  const [, messageDispatch] = useMessageStateValue()

  const fuckingReactRulesJustUseShareLink = useMutation(USE_SHARE_LINK, {
    refetchQueries: [{
      query: WORKSPACES_FOR_USER
    }]
  })

  const type = token[0] === 'w' ? 'workspace' : 'project'
  token = token.substr(1)

  const peek = useQuery(PEEK_SHARE_LINK, {
    variables: { token }
  })

  const handleClose = () => history.push('/user')

  const handleCreate = () => {
    setLoading(true)
    fuckingReactRulesJustUseShareLink({
      variables: { token }
    }).then(resp => {
      history.push(`/workspaces/${resp.data.joinWorkspace.workspace.id}/mapper`)
    }).catch(() => {
      messageDispatch({
        type: 'setError',
        data: 'Access denied'
      })
      setLoading(false)
    })
  }

  if (peek.data.peekWorkspace) {
    const participant = peek.data.peekWorkspace.participants.find(pcp => pcp.user.id === user.id)
    if (participant) {
      return <Redirect to={`/workspaces/${peek.data.peekWorkspace.id}/mapper`} />
    }
  }

  return (
    <Dialog open onClose={handleClose}>
      <DialogTitle>Join {type}</DialogTitle>
      {peek.data.peekWorkspace ? <>
        <DialogContent>
          <DialogContentText>
            You have been invited to the {type} {peek.data.peekWorkspace.name}.
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
          <DialogContentText>
            <CircularProgress />
          </DialogContentText>
        </DialogContent>
      )}
    </Dialog>
  )
}

export default withRouter(JoinView)
