import React, { useState } from 'react'
import { withStyles } from '@material-ui/core/styles'

import { useMutation, useApolloClient } from 'react-apollo-hooks'
import { DELETE_CONCEPT, LINK_PREREQUISITE, DELETE_LINK } from '../../services/ConceptService'
import { COURSE_PREREQUISITE_COURSES } from '../../services/CourseService'

import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'

import IconButton from '@material-ui/core/IconButton'
import MoreVertIcon from '@material-ui/icons/MoreVert'

const styles = theme => ({
  conceptName: {
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

const MaterialConcept = ({ classes, course, activeCourseId, concept, activeConceptIds, openConceptEditDialog }) => {
  const [state, setState] = useState({ anchorEl: null })

  const client = useApolloClient()

  const deleteLink = useMutation(DELETE_LINK, {
    update: (store, response) => {
      const dataInStore = store.readQuery({ query: COURSE_PREREQUISITE_COURSES, variables: { id: activeCourseId } })
      const deletedLink = response.data.deleteLink
      const dataInStoreCopy = { ...dataInStore }
      const courseForConcept = dataInStoreCopy.courseById.prerequisiteCourses.find(c => c.id === course.id)
      courseForConcept.concepts.forEach(concept => {
        concept.linksFromConcept = concept.linksFromConcept.filter(l => l.id !== deletedLink.id)
      })
      client.writeQuery({
        query: COURSE_PREREQUISITE_COURSES,
        variables: { id: activeCourseId },
        data: dataInStoreCopy
      })
    }
  })

  const linkPrerequisite = useMutation(LINK_PREREQUISITE, {
    update: (store, response) => {
      const dataInStore = store.readQuery({ query: COURSE_PREREQUISITE_COURSES, variables: { id: activeCourseId } })
      const addedLink = response.data.createLink
      const dataInStoreCopy = { ...dataInStore }
      const courseForConcept = dataInStoreCopy.courseById.prerequisiteCourses.find(c => c.id === course.id)
      const concept = courseForConcept.concepts.find(c => c.id === addedLink.from.id)
      concept.linksFromConcept.push(addedLink)
      client.writeQuery({
        query: COURSE_PREREQUISITE_COURSES,
        variables: { id: activeCourseId },
        data: dataInStoreCopy
      })
    }
  })


  const includedIn = (set, object) =>
    set.map(p => p.id).includes(object.id)

  const deleteConcept = useMutation(DELETE_CONCEPT, {
    update: (store, response) => {
      const dataInStore = store.readQuery({ query: COURSE_PREREQUISITE_COURSES, variables: { id: activeCourseId } })
      const deletedConcept = response.data.deleteConcept
      const dataInStoreCopy = { ...dataInStore }
      const prereqCourse = dataInStoreCopy.courseById.prerequisiteCourses.find(c => c.id === course.id)
      if (includedIn(prereqCourse.concepts, deletedConcept)) {
        prereqCourse.concepts = prereqCourse.concepts.filter(c => c.id !== deletedConcept.id)
        client.writeQuery({
          query: COURSE_PREREQUISITE_COURSES,
          variables: { id: activeCourseId },
          data: dataInStoreCopy
        })
      }
    }
  })

  const isActive = () => {
    return concept.linksFromConcept.find(link => {
      return activeConceptIds.find(conceptId => link.to.id === conceptId)
    })
  }

  const onClick = async () => {
    if (activeConceptIds === []) return
    const isActive = concept.linksFromConcept.find(link => {
      return activeConceptIds.find(conceptId => link.to.id === conceptId)
    })
    if (isActive) {
      concept.linksFromConcept.forEach(link => {
        const hasLink = activeConceptIds.find(conceptId => link.to.id === conceptId)
        if (hasLink) {
          deleteLink({ variables: { id: link.id } })
        }
      })
    } else {
      activeConceptIds.forEach(conceptId =>
        linkPrerequisite({
          variables: {
            to: conceptId,
            from: concept.id
          }
        }))
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
      deleteConcept({ variables: { id } })
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
      className={isActive() ? classes.active : classes.inactive}
      id={'concept-' + concept.id}
    >
      <ListItemText className={classes.conceptName} id={'concept-name-' + concept.id}>
        {concept.name}
      </ListItemText>
      {activeConceptIds.length === 0 ?
        <ListItemSecondaryAction id={'concept-secondary-' + concept.id}>
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