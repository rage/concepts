import React, { useState } from 'react'
import { withStyles } from '@material-ui/core/styles'

import { useMutation } from 'react-apollo-hooks'
import { UPDATE_CONCEPT, DELETE_CONCEPT } from '../../services/ConceptService'
import { ALL_COURSES } from '../../services/CourseService'

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';

const styles = theme => ({
  active: {
    backgroundColor: '#9ecae1',
    "&:hover": {
      backgroundColor: '#9ecae1'
    },
    "&:focus": {
      backgroundColor: '#9ecae1'
    }
  },
  inactive: {
    backgroundColor: '#fff',
    "&:focus": {
      backgroundColor: '#fff'
    }
  }
})

const MaterialConcept = ({ classes, concept, activeConceptId, linkPrerequisite, deleteLink, deleteConcept, openConceptEditDialog }) => {
  const [state, setState] = useState({ anchorEl: null })

  const isActive = () => {
    return concept.linksFromConcept.find(link => {
      return link.to.id === activeConceptId
    })
  }

  const onClick = async () => {
    if (activeConceptId === '') return
    const isActive = concept.linksFromConcept.find(link => {
      return link.to.id === activeConceptId
    })
    isActive ?
      await deleteLink({
        variables: { id: isActive.id }
      })
      :
      await linkPrerequisite({
        variables: {
          to: activeConceptId,
          from: concept.id
        }
      })
  }

  const handleMenuOpen = (event) => {
    setState({ anchorEl: event.currentTarget })
  }

  const handleMenuClose = () => {
    setState({ anchorEl: null })
  }

  const handleDeleteConcept = (id) => async () => {
    const willDelete = window.confirm('Are you sure about this?')
    if (willDelete) {
      console.log('delete', id)
      console.log(deleteConcept)

      await deleteConcept({
        variables: { id }
      })
    }
    handleMenuClose()
  }

  const handleEditConcept = (id, name, description) => () => {
    handleMenuClose()
    openConceptEditDialog(id, name, description)()
  }

  return (
    <ListItem divider button={activeConceptId !== ''} onClick={onClick} className={isActive() ? classes.active : classes.inactive}>
      <ListItemText>
        {concept.name}
      </ListItemText>
      {activeConceptId === '' ?
        <ListItemSecondaryAction>
          <IconButton
            aria-owns={state.anchorEl ? 'simple-menu' : undefined}
            aria-haspopup="true"
            onClick={handleMenuOpen}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            id="simple-menu"
            anchorEl={state.anchorEl}
            open={Boolean(state.anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleEditConcept(concept.id, concept.name, concept.description)}>Edit</MenuItem>
            <MenuItem onClick={handleDeleteConcept(concept.id)}>Delete</MenuItem>
          </Menu>
        </ListItemSecondaryAction> : null
      }
    </ListItem>
  )
}

export default withStyles(styles)(MaterialConcept)