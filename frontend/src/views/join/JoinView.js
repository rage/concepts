import React, { useState } from 'react'
import { Redirect } from 'react-router-dom'
import {
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button
} from '@material-ui/core'
import { useQuery, useMutation } from 'react-apollo-hooks'

import { Privilege, Role } from '../../lib/permissions'
import { USE_SHARE_LINK } from '../../graphql/Mutation'
import {
  WORKSPACES_FOR_USER, PEEK_SHARE_LINK, PEEK_SHARE_LINK_HACK, PROJECTS_FOR_USER
} from '../../graphql/Query'
import { useMessageStateValue, useLoginStateValue } from '../../lib/store'
import CloneView from '../project/CloneView'
import LoadingBar from '../../components/LoadingBar'
import useRouter from '../../lib/useRouter'

const JoinView = ({ token }) => {
  const { history } = useRouter()

  const [loading, setLoading] = useState(false)
  const [{ user }] = useLoginStateValue()
  const [, messageDispatch] = useMessageStateValue()

  const type = token[0] === 'w' ? 'workspace' : 'project'
  const privilege = Privilege.fromToken(token)

  const refetchQueries = type === 'workspace'
    ? [{ query: WORKSPACES_FOR_USER }]
    : user.role >= Role.STAFF && privilege !== Privilege.CLONE
      ? [{ query: PROJECTS_FOR_USER }]
      : []

  const joinShareLink = useMutation(USE_SHARE_LINK, {
    refetchQueries
  })

  const peek = useQuery(
    privilege === Privilege.CLONE ? PEEK_SHARE_LINK_HACK : PEEK_SHARE_LINK,
    {
      variables: { token }
    }
  )

  const handleClose = () => history.push('/')

  const handleCreate = () => {
    setLoading(true)
    joinShareLink({
      variables: { token }
    }).then(resp => {
      if (Privilege.fromString(resp.data.useToken.privilege) === Privilege.CLONE
        && type === 'project') {
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
        <DialogTitle>{type.toTitleCase()} not found</DialogTitle>
        <DialogContentText>
          Please ask for a new share link.
        </DialogContentText>
      </Dialog>
    )
  }

  const participant = peek.data.peekToken.participants.find(pcp => pcp.user.id === user.id)

  if (privilege === Privilege.CLONE) {
    return <CloneView token={token} peek={peek} projectId={participant && peek.data.peekToken.id} />
  }

  if (participant) {
    const path = type === 'workspace'
      ? `/workspaces/${peek.data.peekToken.id}/manager`
      : privilege === Privilege.CLONE
        ? `/projects/${peek.data.peekToken.id}/clone`
        : `/projects/${peek.data.peekToken.id}/overview`
    return <Redirect to={path} />
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

export default JoinView
