import React, { useState } from 'react'
import { withStyles } from '@material-ui/core/styles'

import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'

import IconButton from '@material-ui/core/IconButton'
import MoreVertIcon from '@material-ui/icons/MoreVert'

import Switch from '@material-ui/core/Switch'
import Tooltip from '@material-ui/core/Tooltip';

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
  },
  otherNameActive: {
    color: 'grey'
  },
})

const MaterialConcept = ({ classes, concept, activateConcept, activeConceptId, deleteConcept, openConceptEditDialog }) => {
  const [state, setState] = useState({ anchorEl: null })

  const isActive = () => {
    return activeConceptId === concept.id
  }

  const isPassive = () => {
    return (activeConceptId !== concept.id)
      && (activeConceptId !== '')
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

    // <ListItem divider button onClick={activateConcept(concept.id)} className={isActive() ? classes.active : classes.inactive}>
    <Tooltip title="activate selection of prerequisites" enterDelay={500} leaveDelay={400} placement="left">
      <ListItem divider button onClick={activateConcept(concept.id)} id={'concept-' + concept.id}>
        <Switch
          checked={isActive()}
          color='primary'
        />
        <ListItemText
          id={'concept-name-' + concept.id}
          primaryTypographyProps={isPassive() ? { color: 'textSecondary' } : { color: 'textPrimary' }}
        >
          {concept.name}
        </ListItemText>
        <ListItemSecondaryAction id={'concept-secondary-' + concept.id}>
          {activeConceptId === '' ?
            <React.Fragment>
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
            </React.Fragment>
            : null
          }
        </ListItemSecondaryAction>
      </ListItem >
    </Tooltip>
  )
}

export default withStyles(styles)(MaterialConcept)