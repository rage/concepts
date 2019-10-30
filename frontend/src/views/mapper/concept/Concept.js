import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { useMutation } from 'react-apollo-hooks'
import { makeStyles } from '@material-ui/core/styles'
import {
  ListItem, ListItemText, ListItemSecondaryAction, ListItemIcon, Menu, MenuItem, IconButton, Fade
} from '@material-ui/core'
import {
  MoreVert as MoreVertIcon, ArrowLeft as ArrowLeftIcon, ArrowRight as ArrowRightIcon
} from '@material-ui/icons'
import Tooltip from '@material-ui/core/Tooltip'

import { Role } from '../../../lib/permissions'
import { DELETE_CONCEPT, CREATE_CONCEPT_LINK } from '../../../graphql/Mutation'
import cache from '../../../apollo/update'
import { useMessageStateValue, useLoginStateValue } from '../../../lib/store'
import { useEditConceptDialog } from '../../../dialogs/concept'
import { noPropagation } from '../../../lib/eventMiddleware'
import generateTempId from '../../../lib/generateTempId'

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
  flashLink,
  connectionRef,
  conceptLinkRef,
  activeConceptRef
}) => {
  const [state, setState] = useState({ anchorEl: null })
  const classes = useStyles()

  const [, messageDispatch] = useMessageStateValue()
  const [{ user, loggedIn }] = useLoginStateValue()

  const openEditConceptDialog = useEditConceptDialog(workspaceId, user.role >= Role.STAFF)

  const createConceptLink = useMutation(CREATE_CONCEPT_LINK, {
    update: cache.createConceptLinkUpdate(activeCourseId)
  })

  const deleteConcept = useMutation(DELETE_CONCEPT, {
    update: cache.deleteConceptUpdate()
  })

  const ownType = isActive ? 'concept-circle-active' : 'concept-circle'
  const oppositeType = isActive ? 'concept-circle' : 'concept-circle-active'

  const onClick = noPropagation(async () => {
    if (addingLink?.type === ownType) {
      // We could support creating link from prerequisite to prerequisite,
      // but it's not very intuitive, so we don't.
      setAddingLink(null)
    } else if (addingLink) {
      try {
        const resp = await createConceptLink({
          variables: {
            to: isActive ? concept.id : addingLink.id,
            from: isActive ? addingLink.id : concept.id,
            workspaceId
          },
          optimisticResponse: {
            __typename: 'Mutation',
            createConceptLink: {
              __typename: 'ConceptLink',
              id: generateTempId(),
              official: false,
              frozen: false,
              to: {
                __typename: 'Concept',
                id: isActive ? concept.id : addingLink.id
              },
              from: {
                __typename: 'Concept',
                id: isActive ? addingLink.id : concept.id,
                course: {
                  __typename: 'Course',
                  id: isActive ? addingLink.courseId : activeCourseId
                }
              }
            }
          }
        })
        // FIXME https://github.com/facebook/react/issues/10231#issuecomment-316644950
        // CourseMapperView re-render can take 100ms+, so we force-batch these updates.
        // If/when React starts batching them automatically and removes unstable_batchedUpdates,
        // this needs to be changed too.
        ReactDOM.unstable_batchedUpdates(() => {
          flashLink(resp.data.createConceptLink)
          setAddingLink(null)
        })
      } catch (err) {
        setAddingLink(null)
        messageDispatch({
          type: 'setError',
          data: 'Access denied'
        })
      }
    } else {
      setAddingLink({
        id: concept.id,
        courseId: concept.course.id,
        type: ownType,
        oppositeType
      })
    }
  })

  const handleMenuOpen = evt => setState({ anchorEl: evt.currentTarget })
  const handleMenuClose = () => setState({ anchorEl: null })

  const handleDeleteConcept = async () => {
    const willDelete = window.confirm(`Are you sure you want to delete ${concept.name}?`)
    handleMenuClose()
    if (!willDelete) {
      return
    }
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

  const handleEditConcept = () => {
    handleMenuClose()
    openEditConceptDialog(concept)
  }

  const linkButtonColor = !addingLink && focusedConceptIds.has(concept.id) ? 'secondary' : undefined

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
        classes={{ container: 'focusOverlayScrollParent' }}
        ref={activeConceptRef}
      >
        {isActive && <ListItemIcon>
          <IconButton
            buttonRef={conceptLinkRef} onClick={onClick}
            className={classes.activeConceptCircle}
          >
            <ArrowLeftIcon
              viewBox='7 7 10 10' id={`concept-circle-active-${concept.id}`}
              className='concept-circle-active' color={linkButtonColor} />
          </IconButton>
        </ListItemIcon>}
        <ListItemText className={classes.conceptName}>
          {concept.name}
        </ListItemText>
        <ListItemSecondaryAction>
          <IconButton
            aria-haspopup='true'
            onClick={handleMenuOpen}
            disabled={!loggedIn || (concept.frozen && user.role < Role.STAFF)}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={state.anchorEl}
            open={Boolean(state.anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleEditConcept}>Edit</MenuItem>
            {!concept.frozen && <MenuItem onClick={handleDeleteConcept}>Delete</MenuItem>}
          </Menu>
          {!isActive && <IconButton
            buttonRef={connectionRef}
            onClick={onClick}
            className={classes.conceptCircle}
          >
            <ArrowRightIcon
              viewBox='7 7 10 10' id={`concept-circle-${concept.id}`}
              className='concept-circle' color={linkButtonColor}
            />
          </IconButton>}
        </ListItemSecondaryAction>
      </ListItem>
    </Tooltip>
  )
}

export default Concept
