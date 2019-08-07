import React, { useState } from 'react'
import { useMutation } from 'react-apollo-hooks'
import { makeStyles } from '@material-ui/core/styles'
import {
  ListItem, ListItemText, ListItemSecondaryAction, ListItemIcon, Menu, MenuItem, IconButton
} from '@material-ui/core'
import { MoreVert as MoreVertIcon, ArrowLeft as ArrowLeftIcon } from '@material-ui/icons'

import {
  DELETE_CONCEPT,
  CREATE_CONCEPT_LINK
} from '../../../graphql/Mutation'
import cache from '../../../apollo/update'
import { useMessageStateValue, useLoginStateValue } from '../../../store'
import { useEditConceptDialog } from '../../../dialogs/concept'

const useStyles = makeStyles(() => ({
  conceptName: {
    maxWidth: '60%',
    overflowWrap: 'break-word',
    hyphens: 'auto'
  },
  active: {
    backgroundColor: '#9ecae1',
    '&:hover': {
      backgroundColor: '#9ecae1'
    },
    '&:focus': {
      backgroundColor: '#9ecae1'
    }
  },
  inactive: {
    backgroundColor: '#fff',
    '&:focus': {
      backgroundColor: '#fff'
    }
  }
}))

const Concept = ({
  course,
  activeCourseId,
  concept,
  activeConceptIds,
  addingLink,
  setAddingLink,
  workspaceId,
  connectionRef
}) => {
  const [state, setState] = useState({ anchorEl: null })
  const classes = useStyles()

  const messageDispatch = useMessageStateValue()[1]
  const { loggedIn } = useLoginStateValue()[0]

  const openEditConceptDialog = useEditConceptDialog()

  const createConceptLink = useMutation(CREATE_CONCEPT_LINK, {
    update: cache.createConceptLinkUpdate(activeCourseId, workspaceId)
  })

  const deleteConcept = useMutation(DELETE_CONCEPT, {
    update: cache.deleteConceptUpdate
  })

  const onClick = evt => {
    if (addingLink) {
      setAddingLink(null)
      createConceptLink({
        variables: {
          to: addingLink.id,
          from: concept.id,
          workspaceId
        }
      }).catch(() => messageDispatch({
        type: 'setError',
        data: 'Access denied'
      }))
    } else {
      setAddingLink({
        id: concept.id,
        type: 'concept-circle'
      })
    }
    evt.stopPropagation()
  }

  const handleMenuOpen = (event) => {
    setState({ anchorEl: event.currentTarget })
  }

  const handleMenuClose = () => {
    setState({ anchorEl: null })
  }

  const handleDeleteConcept = async () => {
    const willDelete = window.confirm('Are you sure about this?')
    handleMenuClose()
    if (willDelete) {
      try {
        await deleteConcept({ variables: { id: concept.id } })
      } catch (err) {
        messageDispatch({
          type: 'setError',
          data: 'Access denied'
        })
      }
    }
  }

  const handleEditConcept = () => {
    handleMenuClose()
    openEditConceptDialog(concept.id, concept.name, concept.description)
  }

  const hasLinkToAddingLink = addingLink &&
    concept.linksFromConcept.find(link => link.to.id === addingLink.id) !== undefined
  const addingLinkIsOpposite = addingLink && addingLink.type !== 'concept-circle'

  const linkButtonColor = (addingLink && !hasLinkToAddingLink && addingLinkIsOpposite)
    ? 'secondary' : undefined

  return (
    <ListItem
      divider
      button={activeConceptIds.length !== 0}
      onClick={onClick}
      className={classes.inactive}
      id={'concept-' + concept.id}
    >
      <ListItemIcon>
        <IconButton buttonRef={connectionRef} onClick={onClick} style={{ padding: '4px' }}>
          <ArrowLeftIcon
            viewBox='7 7 10 10' id={`concept-circle-${concept.id}`}
            color={linkButtonColor} />
        </IconButton>
      </ListItemIcon>
      <ListItemText className={classes.conceptName} id={'concept-name-' + concept.id}>
        {concept.name}
      </ListItemText>
      <ListItemSecondaryAction id={'concept-secondary-' + concept.id}>
        {activeConceptIds.length === 0 ?
          <React.Fragment>
            {
              loggedIn ?
                <IconButton
                  aria-owns={state.anchorEl ? 'simple-menu' : undefined}
                  aria-haspopup='true'
                  onClick={handleMenuOpen}
                >
                  <MoreVertIcon />
                </IconButton> : null
            }
            <Menu
              id='simple-menu'
              anchorEl={state.anchorEl}
              open={Boolean(state.anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleEditConcept}>Edit</MenuItem>
              <MenuItem onClick={handleDeleteConcept}>Delete</MenuItem>
            </Menu>
          </React.Fragment>
          : null
        }
      </ListItemSecondaryAction>
    </ListItem>
  )
}

export default Concept
