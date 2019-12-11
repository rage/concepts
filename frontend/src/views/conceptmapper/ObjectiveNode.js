import React from 'react'
import {
  IconButton,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
  ListItemIcon
} from '@material-ui/core'
import {
  ArrowLeft as ArrowLeftIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@material-ui/icons'
import { makeStyles } from '@material-ui/core/styles'
import { useMutation } from 'react-apollo-hooks'

import { DragHandle, SortableItem } from '../../lib/sortableMoc'
import { DELETE_CONCEPT } from '../../graphql/Mutation'
import cache from '../../apollo/update'
import { useEditConceptDialog } from '../../dialogs/concept'
import { Role } from '../../lib/permissions'
import { useLoginStateValue } from '../../lib/store'

const useStyles = makeStyles(() => ({
  hoverButton: {
    visibility: 'hidden'
  },
  conceptBody: {
    paddingRight: '56px',
    userSelect: 'none'
  },
  root: {
    listStyle: 'none',
    '&:hover': {
      '& $hoverButton': {
        visibility: 'visible'
      },
      '& $conceptBody': {
        paddingRight: '160px'
      }
    }
  }
}))

const ObjectiveNode = ({ workspaceId, concept, index }) => {
  const classes = useStyles()
  const [{ user }] = useLoginStateValue()

  const deleteConcept = useMutation(DELETE_CONCEPT, {
    update: cache.deleteConceptUpdate(workspaceId)
  })

  const openEditObjectiveDialog = useEditConceptDialog(workspaceId, user.role >= Role.STAFF)

  const handleDelete = () => {
    const msg = `Are you sure you want to delete the objective ${concept.name}?`
    if (window.confirm(msg)) {
      deleteConcept({
        variables: {
          id: concept.id
        }
      })
    }
  }

  const handleEdit = () => openEditObjectiveDialog(concept)

  return (
    <SortableItem
      index={index} classes={{ container: `${classes.root} concept-root` }}
      ContainerProps={{ 'data-concept-id': concept.id }}
    >
      <ListItemIcon>
        <IconButton onClick={() => alert('Not yet implemented')} className={classes.conceptCircle}>
          <ArrowLeftIcon viewBox='7 7 10 10' id={`objective-circle-${concept.id}`} />
        </IconButton>
      </ListItemIcon>
      <ListItemText className={classes.conceptBody}>
        <Typography variant='h6' className={classes.conceptName}>
          {concept.name}
        </Typography>
      </ListItemText>
      <ListItemSecondaryAction>
        <IconButton
          title={concept.frozen ? 'This concept is frozen' : undefined}
          disabled={concept.frozen} className={classes.hoverButton} onClick={handleDelete}
        >
          <DeleteIcon />
        </IconButton>
        <IconButton className={classes.hoverButton} onClick={handleEdit}>
          <EditIcon />
        </IconButton>
        <DragHandle />
      </ListItemSecondaryAction>
    </SortableItem>
  )
}

export default ObjectiveNode
