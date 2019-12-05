import React, { useState, useRef, useEffect } from 'react'
import { useMutation, useQuery } from 'react-apollo-hooks'
import { makeStyles } from '@material-ui/core/styles'
import { Menu, MenuItem } from '@material-ui/core'

import { COURSE_BY_ID_WITH_LINKS } from '../../graphql/Query'
import NotFoundView from '../error/NotFoundView'
import LoadingBar from '../../components/LoadingBar'
import ConceptNode from './ConceptNode'
import { ConceptLink } from '../coursemapper/concept'
import {
  CREATE_CONCEPT,
  CREATE_CONCEPT_LINK,
  DELETE_CONCEPT,
  UPDATE_CONCEPT
} from '../../graphql/Mutation'
import cache from '../../apollo/update'

const useStyles = makeStyles({
  root: {
    gridArea: 'content',
    position: 'relative',
    userSelect: 'none',
    transform: 'translate(0, 0)',
    transformOrigin: '0 0'
  },
  selection: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 0, 0, .25)',
    border: '4px solid red',
    display: 'none',
    zIndex: 6
  }
})

const sliderMinLinear = 0
const sliderMaxLinear = 200

const sliderMinLog = Math.log(0.2)
const sliderMaxLog = Math.log(5)

const sliderScale = (sliderMaxLog - sliderMinLog) / (sliderMaxLinear - sliderMinLinear)

const linearToLog = position =>
  Math.exp(sliderMinLog + (sliderScale * (position - sliderMinLinear)))
const logToLinear = value =>
  ((Math.log(value) - sliderMinLog) / sliderScale) + sliderMinLinear

const ConceptMapperView = ({ workspaceId, courseId }) => {
  const [adding, setAdding] = useState(null)
  const [addingLink, setAddingLink] = useState(null)
  const [menu, setMenu] = useState({ open: false })
  const panning = useRef(false)
  const pan = useRef({ x: 0, y: 0, zoom: 1, linearZoom: logToLinear(1) })
  const selected = useRef(new Set())
  const concepts = useRef({})
  const selection = useRef()
  const selectionRef = useRef()
  const main = useRef()
  const root = document.getElementById('root')
  const classes = useStyles()

  const createConcept = useMutation(CREATE_CONCEPT, {
    update: cache.createConceptUpdate(workspaceId)
  })

  const updateConcept = useMutation(UPDATE_CONCEPT, {
    update: cache.updateConceptUpdate(workspaceId)
  })

  const deleteConcept = useMutation(DELETE_CONCEPT, {
    update: cache.deleteConceptUpdate(workspaceId)
  })

  const createConceptLink = useMutation(CREATE_CONCEPT_LINK, {
    update: cache.createConceptLinkUpdate()
  })

  const courseQuery = useQuery(COURSE_BY_ID_WITH_LINKS, {
    variables: { id: courseId }
  })

  const updateSelection = (axisKey, posKey, lenKey, value, offset) => {
    const initialValue = selection.current.start[axisKey]
    if (value > initialValue) {
      selection.current.pos[posKey] = initialValue + offset
      selection.current.pos[lenKey] = value - initialValue
    } else {
      selection.current.pos[posKey] = value + offset
      selection.current.pos[lenKey] = initialValue - value
    }
    selection.current.pos[posKey] /= pan.current.zoom
    selection.current.pos[lenKey] /= pan.current.zoom
    selectionRef.current.style[posKey] = `${selection.current.pos[posKey]}px`
    selectionRef.current.style[lenKey] = `${selection.current.pos[lenKey]}px`
  }

  const updateSelected = () => {
    const sel = selection.current.pos
    const selLeftEnd = sel.left + sel.width
    const selTopEnd = sel.top + sel.height
    for (const [id, state] of Object.entries(concepts.current)) {
      if (!state.node) continue
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

  const mouseDown = evt => {
    if (evt.button !== 0) {
      return
    }
    if (evt.target !== main.current && evt.target !== root) {
      if (addingLink && evt.target.hasAttribute('data-concept-id')) {
        finishAddingLink(evt.target.getAttribute('data-concept-id'))
      }
      return
    }
    if (addingLink) {
      setAddingLink(null)
    }
    if (evt.shiftKey) {
      const x = evt.pageX - main.current.offsetLeft
      const y = evt.pageY - main.current.offsetTop
      selection.current = {
        pos: {
          left: x + pan.current.x,
          top: y + pan.current.y,
          width: 0,
          height: 0
        },
        start: { x, y }
      }
      selectionRef.current.style.left = `${selection.current.pos.left}px`
      selectionRef.current.style.top = `${selection.current.pos.top}px`
      selectionRef.current.style.width = 0
      selectionRef.current.style.height = 0
      selectionRef.current.style.display = 'block'
      updateSelected()
    } else {
      panning.current = true
    }
  }

  const mouseMove = evt => {
    if (panning.current) {
      pan.current.y -= evt.movementY
      pan.current.x -= evt.movementX
      main.current.style.transform =
        `translate(${-pan.current.x}px, ${-pan.current.y}px) scale(${pan.current.zoom})`
    } else if (selection.current) {
      updateSelection('x', 'left', 'width',
        evt.pageX - main.current.offsetLeft,
        pan.current.x)
      updateSelection('y', 'top', 'height',
        evt.pageY - main.current.offsetTop,
        pan.current.y)
      updateSelected()
    }
  }

  const mouseUp = () => {
    if (selection.current) {
      selection.current = null
      selectionRef.current.style.display = 'none'
    } else if (panning.current) {
      panning.current = false
    }
  }

  const mouseWheel = evt => {
    pan.current.linearZoom -= evt.deltaY
    if (pan.current.linearZoom < sliderMinLinear) {
      pan.current.linearZoom = sliderMinLinear
    } else if (pan.current.linearZoom > sliderMaxLinear) {
      pan.current.linearZoom = sliderMaxLinear
    }
    pan.current.x /= pan.current.zoom
    pan.current.y /= pan.current.zoom
    pan.current.zoom = linearToLog(pan.current.linearZoom)
    pan.current.x *= pan.current.zoom
    pan.current.y *= pan.current.zoom
    main.current.style.transform =
      `translate(${-pan.current.x}px, ${-pan.current.y}px) scale(${pan.current.zoom})`
  }

  const doubleClick = evt => {
    if (evt.target === main.current || evt.target === root) {
      setAdding({
        x: ((evt.pageX - main.current.offsetLeft + pan.current.x) / pan.current.zoom) - 100,
        y: ((evt.pageY - main.current.offsetTop + pan.current.y) / pan.current.zoom) - 17
      })
    }
  }

  useEffect(() => {
    window.addEventListener('mousedown', mouseDown)
    window.addEventListener('mousemove', mouseMove)
    window.addEventListener('mouseup', mouseUp)
    window.addEventListener('wheel', mouseWheel)
    window.addEventListener('dblclick', doubleClick)
    return () => {
      window.removeEventListener('mousedown', mouseDown)
      window.removeEventListener('mousemove', mouseMove)
      window.removeEventListener('mouseup', mouseUp)
      window.removeEventListener('wheel', mouseWheel)
      window.removeEventListener('dblclick', doubleClick)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (courseQuery.error) {
    return <NotFoundView message='Course not found' />
  } else if (!courseQuery.data.courseById) {
    return <LoadingBar id='course-view' />
  }

  const course = courseQuery.data.courseById

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

  const menuDeleteConcept = () => {
    deleteConcept({
      variables: {
        id: menu.id
      }
    })
    closeMenu()
  }

  const linkOffsets = {
    y0: -58,
    y1: -58
  }

  return (
    <main className={classes.root} ref={main}>
      {course.concepts.flatMap(concept => [
        <ConceptNode
          key={concept.id} workspaceId={workspaceId} concept={concept} pan={pan}
          openMenu={openMenu(concept.id)} closeMenu={() => menu.id === concept.id && closeMenu()}
          concepts={concepts} selected={selected} submit={submitExistingConcept(concept.id)}
        />,
        ...concept.linksToConcept.map(link => <ConceptLink
          key={link.id} delay={1} active linkId={link.id}
          within='concept-mapper-link-container' posOffsets={linkOffsets}
          scrollParentRef={pan} noListenScroll
          from={`concept-${concept.id}`} to={`concept-${link.from.id}`}
          fromConceptId={concept.id} toConceptId={link.from.id}
          fromAnchor='center middle' toAnchor='center middle'
        />)
      ])}
      <div ref={selectionRef} className={classes.selection} />
      {adding && <ConceptNode
        isNew concept={{ id: 'new', name: '', position: adding }}
        concepts={concepts} selected={selected}
        cancel={stopAdding} submit={submitNewConcept}
      />}
      {addingLink && <ConceptLink
        active within={document.body}
        followMouse from={`concept-${addingLink}`} to={`concept-${addingLink}`}
      />}
      <div id='concept-mapper-link-container' />

      <Menu
        keepMounted anchorReference='anchorPosition' anchorPosition={menu.anchor}
        open={menu.open} onClose={closeMenu}
      >
        <MenuItem onClick={menuAddLink}>Add link</MenuItem>
        <MenuItem onClick={menuDeleteConcept}>Delete concept</MenuItem>
      </Menu>
    </main>
  )
}

export default ConceptMapperView
