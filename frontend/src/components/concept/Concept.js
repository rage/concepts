import React, { useState } from 'react'
import { withStyles } from '@material-ui/core/styles'

import { useMutation, useApolloClient } from 'react-apollo-hooks'

import { 
  DELETE_CONCEPT, 
  CREATE_CONCEPT_LINK, 
  DELETE_CONCEPT_LINK 
} from '../../graphql/Mutation'
import { FETCH_COURSE_AND_PREREQUISITES } from '../../graphql/Query'

import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'

import IconButton from '@material-ui/core/IconButton'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import Switch from '@material-ui/core/Switch'

// Error dispatcher
import { useErrorStateValue, useLoginStateValue } from '../../store'

const styles = theme => ({
  conceptName: {
    maxWidth: '85%',
    wordBreak: 'break-word'
  },
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

const Concept = ({ classes, course, activeCourseId, concept, activeConceptIds, openConceptEditDialog, workspaceId }) => {
  const [state, setState] = useState({ anchorEl: null })

  const client = useApolloClient()

  const errorDispatch = useErrorStateValue()[1]
  const { loggedIn } = useLoginStateValue()[0]

  const deleteConceptLink = useMutation(DELETE_CONCEPT_LINK, {
    update: (store, response) => {
      try {
        const dataInStore = store.readQuery({
          query: FETCH_COURSE_AND_PREREQUISITES,
          variables: {
            courseId: activeCourseId,
            workspaceId
          }
        })

        const deletedConceptLink = response.data.deleteConceptLink
        const dataInStoreCopy = { ...dataInStore }

        dataInStoreCopy.courseAndPrerequisites.linksToCourse.forEach(courseLink => {
          courseLink.from.concepts.forEach(concept => {
            concept.linksFromConcept = concept.linksFromConcept.filter(conceptLink => conceptLink.id !== deletedConceptLink.id)
          })
        })

        client.writeQuery({
          query: FETCH_COURSE_AND_PREREQUISITES,
          variables: {
            courseId: activeCourseId,
            workspaceId
          },
          data: dataInStoreCopy
        })
      } catch (err) {

      }
    }
  })

  const createConceptLink = useMutation(CREATE_CONCEPT_LINK, {
    update: (store, response) => {
      try {
        const dataInStore = store.readQuery({
          query: FETCH_COURSE_AND_PREREQUISITES,
          variables: {
            courseId: activeCourseId,
            workspaceId
          }
        })
        const createdConceptLink = response.data.createConceptLink
        const dataInStoreCopy = { ...dataInStore }

        dataInStoreCopy.courseAndPrerequisites.linksToCourse.forEach(courseLink => {
          const concept = courseLink.from.concepts.find(concept => concept.id === createdConceptLink.from.id)
          if (concept) {
            concept.linksFromConcept.push(createdConceptLink)
          }
        })

        client.writeQuery({
          query: FETCH_COURSE_AND_PREREQUISITES,
          variables: {
            courseId: activeCourseId,
            workspaceId
          },
          data: dataInStoreCopy
        })

      } catch (err) {

      }
    }
  })


  const includedIn = (set, object) =>
    set.map(p => p.id).includes(object.id)

  const deleteConcept = useMutation(DELETE_CONCEPT, {
    update: (store, response) => {
      const dataInStore = store.readQuery({
        query: FETCH_COURSE_AND_PREREQUISITES,
        variables: {
          courseId: activeCourseId,
          workspaceId
        }
      })

      const deletedConcept = response.data.deleteConcept
      const dataInStoreCopy = { ...dataInStore }
      const courseLink =  dataInStoreCopy.courseAndPrerequisites.linksToCourse.find(link => link.from.id === course.id)
      const prereqCourse = courseLink.from
      if (includedIn(prereqCourse.concepts, deletedConcept)) {
        prereqCourse.concepts = prereqCourse.concepts.filter(c => c.id !== deletedConcept.id)
        client.writeQuery({
          query: FETCH_COURSE_AND_PREREQUISITES,
          variables: { 
            courseId: activeCourseId, 
            workspaceId 
          },
          data: dataInStoreCopy
        })
      }
    }
  })

  const isActive = () => {
    return undefined !== concept.linksFromConcept.find(link => {
      return activeConceptIds.find(conceptId => link.to.id === conceptId)
    })
  }

  const onClick = async () => {
    if (isActive()) {
      concept.linksFromConcept.forEach(async (link) => {
        const hasLink = activeConceptIds.find(conceptId => link.to.id === conceptId)
        if (hasLink) {
          try {
            await deleteConceptLink({ variables: { id: link.id } })
          } catch (err) {
            errorDispatch({
              type: 'setError',
              data: 'Access denied'
            })
          }
        }
      })
    } else {
      activeConceptIds.forEach(async (conceptId) => {
        try {
          await createConceptLink({
            variables: {
              to: conceptId,
              from: concept.id,
              workspaceId
            }
          })
        } catch (err) {
          errorDispatch({
            type: 'setError',
            data: 'Access denied'
          })
        }
      })
    }
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
      try {
        await deleteConcept({ variables: { id } })
      } catch (err) {
        errorDispatch({
          type: 'setError',
          data: 'Access denied'
        })
      }
    }
    handleMenuClose()
  }

  const handleEditConcept = (id, name, description) => () => {
    handleMenuClose()
    openConceptEditDialog(id, name, description)()
  }

  return (
    <ListItem
      divider
      button={activeConceptIds.length !== 0}
      onClick={onClick}
      className={classes.inactive}
      id={'concept-' + concept.id}
    >
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
                  aria-haspopup="true"
                  onClick={handleMenuOpen}
                >
                  <MoreVertIcon />
                </IconButton> : null
            }
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
          :
          <Switch
            checked={isActive()}
            color='primary'
            onClick={onClick}
            id={'concept-switch' + concept.id}
          />
        }
      </ListItemSecondaryAction>
    </ListItem>
  )
}

export default withStyles(styles)(Concept)