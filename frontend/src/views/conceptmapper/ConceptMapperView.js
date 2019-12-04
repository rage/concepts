import React, { useState, useRef } from 'react'
import { useMutation, useQuery } from 'react-apollo-hooks'
import { makeStyles } from '@material-ui/core/styles'
import { Menu, MenuItem } from '@material-ui/core'

import { COURSE_BY_ID_WITH_LINKS } from '../../graphql/Query'
import NotFoundView from '../error/NotFoundView'
import LoadingBar from '../../components/LoadingBar'
import ConceptNode from './ConceptNode'
import { ConceptLink } from '../coursemapper/concept'
import {CREATE_CONCEPT, CREATE_CONCEPT_LINK, UPDATE_CONCEPT} from '../../graphql/Mutation'
import cache from '../../apollo/update'
import generateTempId from '../../lib/generateTempId'

const useStyles = makeStyles({
  root: {
    gridArea: 'content',
    position: 'relative',
    userSelect: 'none'
  },
  selection: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 0, 0, .25)',
    border: '4px solid red'
  }
})

const ConceptMapperView = ({ workspaceId, courseId, urlPrefix }) => {
  const [adding, setAdding] = useState(null)
  const [addingLink, setAddingLink] = useState(null)
  const [selecting, setSelecting] = useState(null)
  const [menu, setMenu] = useState({ open: false })
  const selected = useRef(new Set())
  const concepts = useRef({})
  const selection = useRef({})
  const selectionRef = useRef()
  const main = useRef()
  const classes = useStyles()

  const updateConcept = useMutation(UPDATE_CONCEPT, {
    update: cache.updateConceptUpdate(workspaceId)
  })

  const createConcept = useMutation(CREATE_CONCEPT, {
    update: cache.createConceptUpdate(workspaceId)
  })

  const createConceptLink = useMutation(CREATE_CONCEPT_LINK, {
    update: cache.createConceptLinkUpdate()
  })

  const courseQuery = useQuery(COURSE_BY_ID_WITH_LINKS, {
    variables: { id: courseId }
  })

  if (courseQuery.error) {
    return <NotFoundView message='Course not found' />
  } else if (!courseQuery.data.courseById) {
    return <LoadingBar id='course-view' />
  }

  const course = courseQuery.data.courseById

  const doubleClick = evt => {
    if (evt.target === main.current) {
      setAdding({
        x: evt.pageX - main.current.offsetLeft - 100,
        y: evt.pageY - main.current.offsetTop - 15
      })
    }
  }

  const finishAddingLink = async to => {
    await createConceptLink({
      variables: {
        from: addingLink,
        to,
        workspaceId
      }
    })
    setAddingLink(null)
  }

  const startSelect = evt => {
    if (evt.button !== 0) {
      return
    }
    if (evt.target !== main.current) {
      if (addingLink && evt.target.hasAttribute('data-concept-id')) {
        finishAddingLink(evt.target.getAttribute('data-concept-id'))
      }
      return
    }
    if (addingLink) {
      setAddingLink(null)
    }
    const x = evt.pageX - main.current.offsetLeft
    const y = evt.pageY - main.current.offsetTop
    selection.current.left = x
    selection.current.top = y
    selection.current.right = main.current.offsetWidth - x
    selection.current.bottom = main.current.offsetHeight - y
    setSelecting({ x, y })
    updateSelected()
  }

  const updateSelection = (key, a, b, value, offset) => {
    if (value > selecting[key]) {
      selection.current[a] = selecting[key]
      selection.current[b] = offset - value
    } else {
      selection.current[a] = value
      selection.current[b] = offset - selecting[key]
    }
    selectionRef.current.style[a] = `${selection.current[a]}px`
    selectionRef.current.style[b] = `${selection.current[b]}px`
  }

  const updateSelected = () => {
    const sel = selection.current
    const selLeftEnd = main.current.offsetWidth - sel.right
    const selTopEnd = main.current.offsetHeight - sel.bottom
    for (const [id, state] of Object.entries(concepts.current)) {
      if (state.x >= sel.left && state.x + state.width <= selLeftEnd
          && state.y >= sel.top && state.y + state.height <= selTopEnd) {
        selected.current.add(id)
        state.node.classList.add('selected')
      } else {
        selected.current.delete(id)
        state.node.classList.remove('selected')
      }
    }
  }

  const select = evt => {
    if (!selecting || evt.button !== 0) {
      return
    }
    updateSelection('x', 'left', 'right',
      evt.pageX - main.current.offsetLeft, main.current.offsetWidth)
    updateSelection('y', 'top', 'bottom',
      evt.pageY - main.current.offsetTop, main.current.offsetHeight)
    updateSelected()
  }

  const stopSelect = () => {
    selection.current = {}
    setSelecting(null)
  }

  const submitExistingConcept = id => ({ name, position }) => updateConcept({
    variables: {
      id,
      name,
      position
    }
  })

  const submitNewConcept = ({ name, position }) => {
    stopAdding()
    console.log('Submitting concept', name, position)
    return createConcept({
      variables: {
        name,
        description: '',
        level: 'CONCEPT',
        position,
        workspaceId,
        courseId
      }
    })
  }

  const stopAdding = () => {
    delete concepts.current['concept-new']
    setAdding(false)
  }

  const openMenu = id => evt => {
    setMenu({
      id,
      open: true,
      anchor: {
        left: evt.clientX - 2,
        top: evt.clientY - 4
      }
    })
  }

  const closeMenu = () => {
    setMenu({
      ...menu,
      id: null,
      open: false
    })
  }

  const menuAddLink = () => {
    setAddingLink(menu.id)
    closeMenu()
  }

  return <main
    className={classes.root} ref={main}
    onDoubleClick={doubleClick}
    onMouseDown={startSelect} onMouseMove={select} onMouseUp={stopSelect}
  >
    {course.concepts.flatMap(concept => [
      <ConceptNode
        key={concept.id} workspaceId={workspaceId} concept={concept} openMenu={openMenu(concept.id)}
        closeMenu={() => menu.id === concept.id && closeMenu()}
        concepts={concepts} selected={selected} submit={submitExistingConcept(concept.id)}
      />,
      ...concept.linksToConcept.map(link => <ConceptLink
        key={link.id} delay={1} active linkId={link.id}
        from={`concept-${concept.id}`} to={`concept-${link.from.id}`}
        fromConceptId={concept.id} toConceptId={link.from.id}
        fromAnchor='center middle' toAnchor='center middle'
      />)
    ])}
    {selecting && <div
      ref={selectionRef} className={classes.selection} style={{ ...selection.current }}
    /> }
    {adding && <ConceptNode
      isNew concept={{ id: 'new', name: '', position: adding }}
      concepts={concepts} selected={selected}
      cancel={stopAdding} submit={submitNewConcept}
    />}
    {addingLink && <ConceptLink
      active within={document.body} // This needs to be directly in body to work
      followMouse from={`concept-${addingLink}`} to={`concept-${addingLink}`}
    />}

    <Menu
      keepMounted anchorReference='anchorPosition' anchorPosition={menu.anchor}
      open={menu.open} onClose={closeMenu}
    >
      <MenuItem onClick={menuAddLink}>Add link</MenuItem>
    </Menu>
  </main>
}

export default ConceptMapperView
