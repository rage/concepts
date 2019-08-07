import React, { useState } from 'react'
import { useMutation } from 'react-apollo-hooks'
import { makeStyles } from '@material-ui/core/styles'
import {
  ListItem, ListItemText, ListItemSecondaryAction, Menu, MenuItem, IconButton
} from '@material-ui/core'
import { MoreVert as MoreVertIcon, ArrowRight as ArrowRightIcon } from '@material-ui/icons'

import { useMessageStateValue, useLoginStateValue } from '../../../store'
import { CREATE_CONCEPT_LINK, DELETE_CONCEPT } from '../../../graphql/Mutation'
import cache from '../../../apollo/update'
import { useEditConceptDialog } from '../../../dialogs/concept'

const useStyles = makeStyles(() => ({
  conceptName: {
    maxWidth: '70%',
    overflowWrap: 'break-word',
    hyphens: 'auto'
  },
  conceptCircle: {
    zIndex: 2
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
  },
  listItem: {
    width: '100%',
    backgroundColor: '#fff',
    '&:focus': {
      backgroundColor: '#fff'
    }
  },
  otherNameActive: {
    color: 'grey'
  }
}))

const ActiveConcept = ({
  concept,
  conceptLinkRef,
  activeConceptRef,
  toggleConcept,
  activeConceptIds,
  addingLink,
  setAddingLink,
  workspaceId
}) => {
  const [state, setState] = useState({ anchorEl: null })
  const classes = useStyles()
  const messageDispatch = useMessageStateValue()[1]
  const { loggedIn } = useLoginStateValue()[0]
  const openEditConceptDialog = useEditConceptDialog()

  const deleteConcept = useMutation(DELETE_CONCEPT, {
    update: cache.deleteConceptUpdate
  })

  const handleMenuOpen = event => {
    setState({ anchorEl: event.currentTarget })
  }

  const handleMenuClose = () => {
    setState({ anchorEl: null })
  }

  const handleDeleteConcept = async () => {
    const willDelete = window.confirm('Are you sure about this?')
    if (willDelete) {
      handleMenuClose()
      try {
        await deleteConcept({
          variables: { id: concept.id }
        })
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

  const createConceptLink = useMutation(CREATE_CONCEPT_LINK, {
    update: cache.createConceptLinkUpdate(concept.courses[0].id, workspaceId)
  })

  const onClick = evt => {
    if (addingLink) {
      setAddingLink(null)
      createConceptLink({
        variables: {
          to: concept.id,
          from: addingLink.id,
          workspaceId
        }
      }).catch(() => messageDispatch({
        type: 'setError',
        data: 'Access denied'
      }))
    } else {
      setAddingLink({
        id: concept.id,
        type: 'concept-circle-active'
      })
    }
    evt.stopPropagation()
  }

  const hasLinkToAddingLink = addingLink &&
    concept.linksToConcept.find(link => link.from.id === addingLink.id) !== undefined
  const addingLinkIsOpposite = addingLink && addingLink.type !== 'concept-circle-active'

  const linkButtonColor = ((addingLink && !hasLinkToAddingLink && addingLinkIsOpposite)
    || (!addingLink && activeConceptIds.includes(concept.id)))
    ? 'secondary' : undefined

  return (
    <ListItem
      ref={activeConceptRef}
      button divider id={'concept-' + concept.id}
      className={classes.listItem}
      onClick={toggleConcept(concept.id)}
    >
      <ListItemText
        id={'concept-name-' + concept.id}
        className={classes.conceptName}
      >
        {concept.name}
      </ListItemText>
      <ListItemSecondaryAction id={'concept-secondary-' + concept.id}>
        {activeConceptIds.length === 0 ?
          <React.Fragment>
            {loggedIn ?
              <IconButton
                aria-owns={state.anchorEl ? 'simple-menu' : undefined}
                aria-haspopup='true'
                onClick={handleMenuOpen}
              >
                <MoreVertIcon />
              </IconButton>
              : null
            }
            <Menu
              id='simple-menu'
              anchorEl={state.anchorEl}
              open={Boolean(state.anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleEditConcept}>
                Edit
              </MenuItem>
              <MenuItem onClick={handleDeleteConcept}>Delete</MenuItem>
            </Menu>
          </React.Fragment>
          : null
        }
        <IconButton
          buttonRef={conceptLinkRef}
          onClick={onClick}
          className={`${classes.conceptCircle}
          ${activeConceptIds.includes(concept.id) ? 'conceptCircleActive' : ''}`}
        >
          <ArrowRightIcon
            viewBox='7 7 10 10' id={`concept-circle-active-${concept.id}`}
            color={linkButtonColor}
          />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  )
}

export default ActiveConcept
