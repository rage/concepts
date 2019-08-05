import React, { useState, useEffect } from 'react'
import { useMutation, useQuery } from 'react-apollo-hooks'

import { CREATE_PROJECT_SHARE_LINK, DELETE_SHARE_LINK } from '../../graphql/Mutation'
import { PROJECT_BY_ID, PROJECTS_FOR_USER } from '../../graphql/Query'
import { useDialog } from '../DialogProvider'
import LinkSharingActions from '../LinkSharingActions'

const useShareProjectDialog = () => {
  const { openDialog, updateDialog } = useDialog()
  const [projectShareState, setProjectShareState] = useState({
    id: null,
    privilege: null
  })

  const projectQuery = useQuery(PROJECT_BY_ID, {
    skip: !projectShareState.id,
    variables: {
      id: projectShareState.id
    }
  })

  const createShareLink = useMutation(CREATE_PROJECT_SHARE_LINK, {
    refetchQueries: [
      { query: PROJECTS_FOR_USER },
      {
        query: PROJECT_BY_ID,
        variables: {
          id: projectShareState.id
        }
      }
    ]
  })

  const deleteShareLink = useMutation(DELETE_SHARE_LINK)

  const project = projectQuery.data ? projectQuery.data.projectById : null
  const existingToken = project && project.tokens
    .find(token => token.privilege === projectShareState.privilege)
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
        projectId: projectShareState.id,
        privilege: projectShareState.privilege
      }
    })
  }

  useEffect(() => {
    if (project !== null) {
      updateDialog({
        content: [
          'Let other users view and edit the project',
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
    setProjectShareState({ id, privilege })
    openDialog({
      title: 'Share project',
      content: [
        'Let other users view and edit the project',
        url
      ],
      mutation: handleRegenerate,
      CustomActions: LinkSharingActions,
      customActionsProps: {
        target: project,
        url: realURL
      }
    })
  }
}

export default useShareProjectDialog
