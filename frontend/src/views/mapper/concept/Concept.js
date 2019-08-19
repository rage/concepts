import React, { useState } from 'react'
import { useMutation } from 'react-apollo-hooks'
import { makeStyles } from '@material-ui/core/styles'
import {
  ListItem, ListItemText, ListItemSecondaryAction, ListItemIcon, Menu, MenuItem, IconButton, Fade
} from '@material-ui/core'
import {
  MoreVert as MoreVertIcon,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon
} from '@material-ui/icons'
import Tooltip from '@material-ui/core/Tooltip'

import {
  DELETE_CONCEPT,
  CREATE_CONCEPT_LINK
} from '../../../graphql/Mutation'
import cache from '../../../apollo/update'
import { useMessageStateValue, useLoginStateValue } from '../../../store'
import { useEditConceptDialog } from '../../../dialogs/concept'

const useStyles = makeStyles(theme => ({
  conceptName: {
    maxWidth: '60%',
    overflowWrap: 'break-word',
    hyphens: 'auto'
  },
  conceptCircle: {
    zIndex: 2
  },
  activeConceptCircle: {
    zIndex: 2,
    padding: '4px'
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
  listItem: {
    width: '100%',
    backgroundColor: '#fff',
    '&:focus': {
      backgroundColor: '#fff'
    }
  },
  tooltip: {
    backgroundColor: 'white',
    color: 'rgba(0, 0, 0, 0.87)',
    boxShadow: theme.shadows[1],
    fontSize: 16,
    margin: '2px'
  },
  popper: {
    padding: '5px'
  }
}))

const Concept = ({
  workspaceId,
  activeCourseId,
  isActive,
  concept,
  focusedConceptIds,
  toggleFocus,
  addingLink,
  setAddingLink,
  connectionRef,
  conceptLinkRef,
  activeConceptRef
}) => {
  const [state, setState] = useState({ anchorEl: null })
  const classes = useStyles()

  const [, messageDispatch] = useMessageStateValue()
  const [{ loggedIn }] = useLoginStateValue()

  const openEditConceptDialog = useEditConceptDialog()

  const createConceptLink = useMutation(CREATE_CONCEPT_LINK, {
    update: cache.createConceptLinkUpdate(activeCourseId, workspaceId)
  })

  const deleteConcept = useMutation(DELETE_CONCEPT, {
    update: cache.deleteConceptUpdate
  })

  const ownType = isActive ? 'concept-circle-active' : 'concept-circle'

  const onClick = evt => {
    if (addingLink) {
      setAddingLink(null)
      createConceptLink({
        variables: {
          to: isActive ? concept.id : addingLink.id,
          from: isActive ? addingLink.id : concept.id,
          workspaceId
        }
      }).catch(() => messageDispatch({
        type: 'setError',
        data: 'Access denied'
      }))
    } else {
      setAddingLink({
        id: concept.id,
        type: ownType
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
        await deleteConcept({
          variables: {
            id: concept.id
          }
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
    openEditConceptDialog(concept.id, concept.name, concept.description, concept.bloomsTag)
  }

  const hasLinkToAddingLink = addingLink && (isActive
    ? concept.linksToConcept.find(link => link.from.id === addingLink.id) !== undefined
    : concept.linksFromConcept.find(link => link.to.id === addingLink.id) !== undefined)

  const addingLinkIsOpposite = addingLink && addingLink.type !== ownType

  const linkButtonColor = ((addingLink && !hasLinkToAddingLink && addingLinkIsOpposite)
    || (!addingLink && focusedConceptIds.includes(concept.id)))
    ? 'secondary' : undefined

  return (
    <Tooltip
      placement='top'
      classes={{
        tooltip: classes.tooltip,
        popper: classes.popper
      }}
      TransitionComponent={Fade}
      title={concept.description || 'No description available'}>
      <ListItem
        divider
        button
        onClick={() => toggleFocus(concept.id)}
        className={classes.listItem}
        ref={activeConceptRef}
      >
        {isActive && <ListItemIcon>
          <IconButton
            buttonRef={conceptLinkRef} onClick={onClick}
            className={`${classes.activeConceptCircle}
                        ${focusedConceptIds.includes(concept.id) ? 'conceptCircleFocused' : ''}`}
          >
            <ArrowLeftIcon
              viewBox='7 7 10 10' id={`concept-circle-active-${concept.id}`}
              color={linkButtonColor} />
          </IconButton>
        </ListItemIcon>}
        <ListItemText className={classes.conceptName}>
          {concept.name}
        </ListItemText>
        <ListItemSecondaryAction>
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
            anchorEl={state.anchorEl}
            open={Boolean(state.anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleEditConcept}>Edit</MenuItem>
            <MenuItem onClick={handleDeleteConcept}>Delete</MenuItem>
          </Menu>
          {!isActive && <IconButton
            buttonRef={connectionRef}
            onClick={onClick}
            className={`${classes.conceptCircle}
                        ${focusedConceptIds.includes(concept.id) ? 'conceptCircleFocused' : ''}`}
          >
            <ArrowRightIcon
              viewBox='7 7 10 10' id={`concept-circle-${concept.id}`}
              color={linkButtonColor}
            />
          </IconButton>}
        </ListItemSecondaryAction>
      </ListItem>
    </Tooltip>
  )
}

export default Concept
