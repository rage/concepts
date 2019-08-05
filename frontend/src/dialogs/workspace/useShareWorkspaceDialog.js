import React, { useState, useEffect } from 'react'
import { useMutation, useQuery } from 'react-apollo-hooks'

import { CREATE_SHARE_LINK, DELETE_SHARE_LINK } from '../../graphql/Mutation'
import { WORKSPACE_BY_ID, WORKSPACES_FOR_USER } from '../../graphql/Query'
import { useDialog } from '../DialogProvider'
import LinkSharingActions from '../LinkSharingActions'

const useShareWorkspaceDialog = () => {
  const { openDialog, updateDialog } = useDialog()
  const [workspaceShareState, setWorkspaceShareState] = useState({
    id: null,
    privilege: null
  })

  const workspaceQuery = useQuery(WORKSPACE_BY_ID, {
    skip: !workspaceShareState.id,
    variables: {
      id: workspaceShareState.id
    }
  })

  const createShareLink = useMutation(CREATE_SHARE_LINK, {
    refetchQueries: [
      { query: WORKSPACES_FOR_USER },
      {
        query: WORKSPACE_BY_ID,
        variables: {
          id: workspaceShareState.id
        }
      }
    ]
  })

  const deleteShareLink = useMutation(DELETE_SHARE_LINK)

  const workspace = workspaceQuery.data ? workspaceQuery.data.workspaceById : null
  const existingToken = workspace && workspace.tokens
    .find(token => token.privilege === workspaceShareState.privilege)
  const existingTokenId = existingToken && existingToken.id

  let url = 'No share links created'
  let realURL = null
  if (existingTokenId) {
    realURL = new URL(window.location)
    realURL.pathname = `/join/${existingTokenId}`
    url = <a href={realURL}>{realURL.host}{realURL.pathname}</a>
  }

  const handleRegenerate = async () => {
    if (existingTokenId) {
      await deleteShareLink({
        variables: {
          id: existingTokenId
        }
      })
    }
    await createShareLink({
      variables: {
        workspaceId: workspaceShareState.id,
        privilege: workspaceShareState.privilege
      }
    })
  }

  useEffect(() => {
    if (workspace !== null) {
      updateDialog({
        content: [
          'Let other users view and edit your workspace',
          url
        ],
        mutation: handleRegenerate,
        customActionsProps: {
          url: realURL
        }
      })
    }
  }, [existingTokenId])

  return (id, privilege) => {
    setWorkspaceShareState({ id, privilege })
    openDialog({
      title: 'Share workspace',
      content: [
        'Let other users view and edit your workspace',
        url
      ],
      mutation: handleRegenerate,
      CustomActions: LinkSharingActions,
      customActionsProps: {
        target: workspace,
        url: realURL
      }
    })
  }
}

export default useShareWorkspaceDialog
