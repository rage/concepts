import React, { useState } from 'react'
import { withStyles } from '@material-ui/core/styles'

import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'

import IconButton from '@material-ui/core/IconButton'
import MoreVertIcon from '@material-ui/icons/MoreVert'

import Tooltip from '@material-ui/core/Tooltip'

import LensIcon from '@material-ui/icons/Lens'

// Error dispatcher
import { useErrorStateValue, useLoginStateValue } from '../../store'

const styles = theme => ({
  conceptName: {
    maxWidth: '70%',
    wordBreak: 'break-word'
  },
  conceptCircle: {
    zIndex: 2,
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
  },
})

const Concept = ({ classes, concept, toggleConcept, activeConceptIds, conceptCircleRef, deleteConcept, openConceptEditDialog }) => {
  const [state, setState] = useState({ anchorEl: null })

  const errorDispatch = useErrorStateValue()[1]
  const { loggedIn } = useLoginStateValue()[0]

  const isActive = () => {
    return undefined !== activeConceptIds.find(activeConceptId => activeConceptId === concept.id)
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
      handleMenuClose()
      try {
        await deleteConcept({
          variables: { id }
        })
      } catch (err) {
        errorDispatch({
          type: 'setError',
          data: 'Access denied'
        })
      }
    }
  }

  const handleEditConcept = (id, name, description) => () => {
    handleMenuClose()
    openConceptEditDialog(id, name, description)()
  }

  return <>
    <Tooltip title="activate selection of prerequisites" enterDelay={500} leaveDelay={400} placement="left">
      <ListItem button divider className={classes.listItem} onClick={toggleConcept(concept.id)} id={'concept-' + concept.id} >
        <ListItemText
          id={'concept-name-' + concept.id}
          className={classes.conceptName}
        >
          {concept.name}
        </ListItemText>
        <ListItemSecondaryAction id={'concept-secondary-' + concept.id}>
          {activeConceptIds.length === 0 ?
            <React.Fragment>
              { loggedIn ?
                <IconButton
                  aria-owns={state.anchorEl ? 'simple-menu' : undefined}
                  aria-haspopup="true"
                  onClick={handleMenuOpen}
                >
                  <MoreVertIcon />
                </IconButton>
                  : null
              }
              <Menu
                id="simple-menu"
                anchorEl={state.anchorEl}
                open={Boolean(state.anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem
                  onClick={handleEditConcept(concept.id, concept.name, concept.description)}
                >
                  Edit
                </MenuItem>
                <MenuItem onClick={handleDeleteConcept(concept.id)}>Delete</MenuItem>
              </Menu>
            </React.Fragment>
            : null
          }
          <IconButton className={classes.conceptCircle}>
            <LensIcon ref={conceptCircleRef} id={`concept-circle-active-${concept.id}`}/>
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem >
    </Tooltip>
  </>
}

export default withStyles(styles)(Concept)
