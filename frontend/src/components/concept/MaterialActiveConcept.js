import React, { useState } from 'react'
import { withStyles } from '@material-ui/core/styles'

import { useMutation } from 'react-apollo-hooks'
import { UPDATE_CONCEPT, DELETE_CONCEPT } from '../../services/ConceptService'
import { ALL_COURSES } from '../../services/CourseService'

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Switch from '@material-ui/core/Switch';

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

const MaterialConcept = ({ classes, concept, activateConcept, activeConceptId, deleteConcept, openConceptEditDialog }) => {
  const [state, setState] = useState({ anchorEl: null })

  const isActive = () => {
    return activeConceptId === concept.id
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
    <ListItem divider button onClick={activateConcept(concept.id)} className={isActive() ? classes.active : classes.inactive}>
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