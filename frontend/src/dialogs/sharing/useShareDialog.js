import React, { useState, useEffect } from 'react'
import { useMutation, useQuery } from 'react-apollo-hooks'

import { Privilege } from '../../lib/permissions'
import {
  CREATE_SHARE_LINK, DELETE_SHARE_LINK, CREATE_PROJECT_SHARE_LINK
} from '../../graphql/Mutation'
import {
  PROJECT_BY_ID,
  PROJECTS_FOR_USER,
  WORKSPACE_BY_ID,
  WORKSPACES_FOR_USER
} from '../../graphql/Query'
import { useDialog } from '../DialogProvider'
import LinkSharingActions from './LinkSharingActions'

const useShareDialog = (type, title, text) => {
  if (type !== 'workspace' && type !== 'project') {
    throw new Error(`Invalid type '${type}' in useShareDialog()`)
  }

  const { openDialog, updateDialog } = useDialog()
  const [shareState, setShareState] = useState({
    id: null,
    privilege: null
  })

  const targetQueryType = type === 'workspace' ? WORKSPACE_BY_ID : PROJECT_BY_ID
  const targetsForUser = type === 'workspace' ? WORKSPACES_FOR_USER : PROJECTS_FOR_USER
  const mutationForType = type === 'workspace' ? CREATE_SHARE_LINK : CREATE_PROJECT_SHARE_LINK

  const targetQuery = useQuery(targetQueryType, {
    skip: !shareState.id,
    variables: {
      id: shareState.id
    }
  })

  const createShareLink = useMutation(mutationForType, {
    refetchQueries: [
      { query: targetsForUser },
      {
        query: targetQueryType,
        variables: {
          id: shareState.id
        }
      }
    ]
  })

  const deleteShareLink = useMutation(DELETE_SHARE_LINK)

  const target = targetQuery.data ? targetQuery.data[`${type}ById`] : null
  const existingToken = target && target.tokens
    .find(token => Privilege.fromString(token.privilege) === shareState.privilege)
  const existingTokenId = existingToken && existingToken.id

  if (!text) {
    text = `Let other users view and edit your ${type}.`
  }

  if (!title) {
    title = `Share ${type}`
  }

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
        [`${type}Id`]: shareState.id,
        privilege: shareState.privilege.toString()
      }
    })
  }

  useEffect(() => {
    if (target !== null) {
      updateDialog({
        content: [text, url],
        mutation: handleRegenerate,
        customActionsProps: {
          url: realURL
        }
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingTokenId])

  return (id, privilege) => {
    setShareState({ id, privilege })
    openDialog({
      title,
      content: [text, url],
      mutation: handleRegenerate,
      CustomActions: LinkSharingActions,
      customActionsProps: {
        target,
        url: realURL
      }
    })
  }
}

export default useShareDialog
