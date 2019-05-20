import React, { useState } from 'react'
import { withStyles } from '@material-ui/core/styles'

import { useMutation } from 'react-apollo-hooks'
import { UPDATE_CONCEPT } from '../../services/ConceptService'

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';

import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';

const styles = theme => ({
  active: {
    backgroundColor: '#9ecae1'
  },
  inactive: {

  }
})

const MaterialConcept = ({ classes, concept, activeConceptId, linkPrerequisite, deleteLink }) => {
 
  const updateConcept = useMutation(UPDATE_CONCEPT, {
    variables: { id: concept.id }
  })

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

  return (
    <ListItem button onClick={onClick} className={isActive() ? classes.active : classes.inactive }>
      <ListItemText>
        {concept.name}
      </ListItemText>
      { activeConceptId === '' ? 
      <ListItemSecondaryAction>
        <IconButton aria-label="Delete">
          <MoreVertIcon />
        </IconButton>
      </ListItemSecondaryAction> : null
      }
    </ListItem>
  )
}

export default withStyles(styles)(MaterialConcept)