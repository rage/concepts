import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useQuery } from 'react-apollo-hooks'
import { makeStyles } from '@material-ui/core/styles'
import { Menu, MenuItem, Divider, Button, ButtonGroup, Typography, Slider } from '@material-ui/core'
import { ArrowDropDown as ArrowDropDownIcon } from '@material-ui/icons'

import { COURSE_BY_ID_WITH_LINKS } from '../../graphql/Query'
import NotFoundView from '../error/NotFoundView'
import LoadingBar from '../../components/LoadingBar'
import ConceptNode from './ConceptNode'
import { ConceptLink } from '../coursemapper/concept'
import {
  CREATE_CONCEPT,
  CREATE_CONCEPT_LINK,
  DELETE_CONCEPT,
  DELETE_CONCEPT_LINK,
  UPDATE_CONCEPT,
  DELETE_MANY_CONCEPTS, UPDATE_MANY_CONCEPTS
} from '../../graphql/Mutation'
import cache from '../../apollo/update'
import {
  useManyUpdatingSubscriptions,
  useUpdatingSubscription
} from '../../apollo/useUpdatingSubscription'
import CourseList from './CourseList'
import { useEditConceptDialog, useCreateConceptDialog } from '../../dialogs/concept'
import { Role } from '../../lib/permissions'
import { useLoginStateValue } from '../../lib/store'
import useCachedMutation from '../../lib/useCachedMutation'
import { useConfirmDelete } from '../../dialogs/alert'

const useStyles = makeStyles({
  root: {
    gridArea: 'content',
    position: 'relative',
    userSelect: 'none',
    transform: 'translate(0, 0)',
    transformOrigin: '0 0'
  },
  objectives: {
    position: 'fixed',
    right: 0,
    top: '48px',
    bottom: '56px',
    minWidth: '350px',
    width: '25%',
    padding: '8px',

    display: 'flex',
    flexDirection: 'column',

    backgroundColor: 'white',
    '& > $button': {
      width: '100%',
      marginTop: '16px'
    }
  },
  button: {},
  toolbar: {
    position: 'fixed',
    top: '50px',
    left: '10px',
    userSelect: 'none'
  },
  toolbarButtonWrapper: {
    '& > *': {
      margin: '0 4px'
    }
  },
  sliderWrapper: {
    top: '110px',
    left: '10px',
    height: '300px',
    position: 'absolute',
    zIndex: 10
  },
  selection: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 0, 0, .25)',
    border: '4px solid red',
    display: 'none',
    zIndex: 6
  },
  emptyText: {
    position: 'fixed',
    display: 'flex',
    width: '100%',
    height: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    pointerEvents: 'none !important'
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

const linkOffsets = { y0: -58, y1: -58 }

const oppositeLevel = {
  OBJECTIVE: 'CONCEPT',
  CONCEPT: 'OBJECTIVE'
}

const conversionOptions = ['CONCEPT', 'OBJECTIVE']

const HackyStatefulSlider = ({ value, hackyRef, ...args }) => {
  const ref = useRef()
  hackyRef.current = {
    setValue(val) {
      const styleVal = `${val / 2}%`
      for (const child of ref.current.children) {
        if (child.classList.contains('MuiSlider-track')) {
          child.style.height = styleVal
        } else if (child.classList.contains('MuiSlider-thumb')) {
          child.style.bottom = styleVal
        } else if (child.nodeName === 'INPUT') {
          child.value = val
        }
      }
    }
  }
  return <Slider value={value} ref={ref} {...args}/>
}

const ConceptMapperView = ({ workspaceId, courseId, urlPrefix }) => {
  const classes = useStyles()
  const confirmDelete = useConfirmDelete()
  const [{ user }] = useLoginStateValue()
  const [adding, setAdding] = useState(null)
  const [addingLink, setAddingLinkState] = useState(null)
  const addingLinkRef = useRef()
  const setAddingLink = val => {
    setAddingLinkState(val)
    addingLinkRef.current = val
  }
  const [menu, setMenu] = useState({ open: false })
  const panning = useRef(false)
  const pan = useRef({ x: 0, y: 0, zoom: 1, linearZoom: logToLinear(1) })
  const selected = useRef(new Set())
  const concepts = useRef({})
  const selection = useRef(null)
  const toolbar = useRef()
  const toolbarEditButton = useRef()
  const hackySliderRef = useRef()
  const selectionRef = useRef()
  const main = useRef()
  const root = document.getElementById('root')

  const [conversionTarget, setConversionTarget] = useState('CONCEPT')
  const conversionDialogRef = useRef(null)
  const [conversionDialogOpen, setConversionDialogOpen] = useState(false)

  const selectNode = useCallback((id, state) => {
    selected.current.add(id)
    toolbar.current.style.display = 'contents'
    if (selected.current.size > 1) {
      toolbarEditButton.current.style.display = 'none'
    }
    if (!state) state = concepts.current[id]
    state.node.classList.add('selected')
  }, [])

  const deselectNode = useCallback((id, state) => {
    selected.current.delete(id)
    if (selected.current.size === 0) {
      toolbar.current.style.display = 'none'
    } else if (selected.current.size === 1) {
      toolbarEditButton.current.style.display = 'inline-flex'
    }
    if (!state) state = concepts.current[id]
    state.node.classList.remove('selected')
  }, [])

  const openCreateObjectiveDialog = useCreateConceptDialog(workspaceId, user.role >= Role.STAFF)

  const openEditConceptDialog = useEditConceptDialog(workspaceId, user.role >= Role.STAFF)

  const subscriptionArgs = { variables: { workspaceId } }
  useUpdatingSubscription('workspace', 'update', subscriptionArgs)
  useManyUpdatingSubscriptions('many concepts', ['delete', 'update'], subscriptionArgs)
  useManyUpdatingSubscriptions(
    ['course', 'concept', 'concept link'], ['create', 'delete', 'update'], subscriptionArgs)

  const createConcept = useCachedMutation(CREATE_CONCEPT, {
    update: cache.createConceptUpdate(workspaceId)
  })

  const updateConcept = useCachedMutation(UPDATE_CONCEPT, {
    update: cache.updateConceptUpdate(workspaceId)
  })

  const deleteConcept = useCachedMutation(DELETE_CONCEPT, {
    update: cache.deleteConceptUpdate(workspaceId)
  })

  const deleteManyConcepts = useCachedMutation(DELETE_MANY_CONCEPTS, {
    update: cache.deleteManyConceptsUpdate(workspaceId)
  })

  const updateManyConcepts = useCachedMutation(UPDATE_MANY_CONCEPTS, {
    update: cache.updateManyConceptsUpdate(workspaceId)
  })

  const createConceptLink = useCachedMutation(CREATE_CONCEPT_LINK, {
    update: cache.createConceptLinkUpdate()
  })

  const deleteConceptLink = useCachedMutation(DELETE_CONCEPT_LINK, {
    update: cache.deleteConceptLinkUpdate()
  })

  const courseQuery = useQuery(COURSE_BY_ID_WITH_LINKS, {
    variables: { id: courseId, workspaceId }
  })

  const adjustZoom = useCallback((delta, mouseX = null, mouseY = null) => {
    pan.current.linearZoom -= delta
    if (pan.current.linearZoom < sliderMinLinear) {
      pan.current.linearZoom = sliderMinLinear
    } else if (pan.current.linearZoom > sliderMaxLinear) {
      pan.current.linearZoom = sliderMaxLinear
    }

    const oldZoom = pan.current.zoom
    pan.current.zoom = linearToLog(pan.current.linearZoom)
    if (mouseX === null) {
      mouseX = main.current.offsetWidth / 2
    }
    if (mouseY === null) {
      mouseY = main.current.offsetHeight / 2
    }
    pan.current.x = ((pan.current.x + mouseX) / oldZoom * pan.current.zoom) - mouseX
    pan.current.y = ((pan.current.y + mouseY) / oldZoom * pan.current.zoom) - mouseY

    main.current.style.transform =
      `translate(${-pan.current.x}px, ${-pan.current.y}px) scale(${pan.current.zoom})`
    hackySliderRef.current.setValue(pan.current.linearZoom)
  }, [])

  useEffect(() => {
    const updateSelection = (axisKey, posKey, lenKey, value, offset) => {
      const sel = selection.current, pn = pan.current
      const initialValue = (sel.start[axisKey] * pn.zoom) - pn[axisKey]
      const minVal = Math.min(value, initialValue)
      const maxVal = Math.max(value, initialValue)
      sel.pos[posKey] = (minVal + offset) / pn.zoom
      sel.pos[lenKey] = (maxVal - minVal) / pn.zoom
      selectionRef.current.style[posKey] = `${sel.pos[posKey]}px`
      selectionRef.current.style[lenKey] = `${sel.pos[lenKey]}px`
    }

    const updateSelected = () => {
      const sel = selection.current.pos
      const selLeftEnd = sel.left + sel.width
      const selTopEnd = sel.top + sel.height
      for (const [id, state] of Object.entries(concepts.current)) {
        if (!state.node) continue
        if (state.x >= sel.left && state.x + state.width <= selLeftEnd
          && state.y >= sel.top && state.y + state.height <= selTopEnd) {
          selectNode(id)
        } else {
          deselectNode(id)
        }
      }
    }

    const finishAddingLink = async to => {
      await createConceptLink({
        variables: {
          from: addingLinkRef.current,
          to,
          workspaceId
        }
      })
      setAddingLink(null)
    }

    const mouseDown = evt => {
      if (evt.button !== 0) {
        return
      }
      if (evt.target !== main.current && evt.target !== root) {
        const conceptRoot = evt.target.closest('.concept-root')
        if (addingLinkRef.current && conceptRoot?.hasAttribute('data-concept-id')) {
          finishAddingLink(conceptRoot.getAttribute('data-concept-id'))
        }
        return
      }
      if (addingLinkRef.current) {
        setAddingLink(null)
      }
      if (evt.shiftKey) {
        const x = (evt.pageX - main.current.offsetLeft + pan.current.x) / pan.current.zoom
        const y = (evt.pageY - main.current.offsetTop + pan.current.y) / pan.current.zoom
        selection.current = {
          pos: {
            left: x,
            top: y,
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
      const mouseX = evt.pageX - main.current.offsetLeft
      const mouseY = evt.pageY - main.current.offsetTop
      const delta = evt.deltaY
      adjustZoom(delta, mouseX, mouseY)
    }

    const doubleClick = evt => {
      if (evt.target === main.current || evt.target === root) {
        setAdding({
          position: {
            x: ((evt.pageX - main.current.offsetLeft + pan.current.x) / pan.current.zoom) - 100,
            y: ((evt.pageY - main.current.offsetTop + pan.current.y) / pan.current.zoom) - 17
          },
          level: 'CONCEPT',
          courseId
        })
      }
    }

    const openBackgroundMenu = evt => {
      if (evt.target === main.current || evt.target === root) {
        setMenu({
          open: 'background',
          anchor: {
            left: evt.clientX - 2,
            top: evt.clientY - 4
          }
        })
        evt.preventDefault()
      }
    }

    window.addEventListener('mousedown', mouseDown)
    window.addEventListener('mousemove', mouseMove)
    window.addEventListener('mouseup', mouseUp)
    window.addEventListener('wheel', mouseWheel)
    window.addEventListener('dblclick', doubleClick)
    window.addEventListener('contextmenu', openBackgroundMenu)
    return () => {
      window.removeEventListener('mousedown', mouseDown)
      window.removeEventListener('mousemove', mouseMove)
      window.removeEventListener('mouseup', mouseUp)
      window.removeEventListener('wheel', mouseWheel)
      window.removeEventListener('dblclick', doubleClick)
      window.removeEventListener('contextmenu', openBackgroundMenu)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const courseConcepts = courseQuery.data.courseById?.concepts
  useEffect(() => {
    if (!courseConcepts || selected.current.size === 0) {
      return
    }
    const conceptSet = new Set(courseConcepts.map(concept => `concept-${concept.id}`))
    for (const elem of selected.current) {
      if (!conceptSet.has(elem)) {
        selected.current.delete(elem)
      }
    }
  }, [courseConcepts])

  const submitExistingConcept = useCallback((id, { name, position }) => updateConcept({
    variables: {
      id,
      name,
      position
    }
  }), [updateConcept])

  const submitAllPosition = useCallback(async () => {
    const data = Array.from(selected.current).map(id => concepts.current[id]).map(state => ({
      id: state.concept.id,
      position: state.position
    }))
    await updateManyConcepts({
      variables: {
        concepts: data
      }
    })
  }, [updateManyConcepts])

  const stopAdding = useCallback(() => {
    delete concepts.current['concept-new']
    setAdding(null)
  }, [setAdding])

  const submitNewConcept = useCallback(async (_, { name, position }) => {
    await createConcept({
      variables: {
        name,
        description: '',
        level: adding.level,
        position,
        workspaceId,
        courseId
      }
    })
    stopAdding()
  }, [createConcept, stopAdding, courseId, workspaceId, adding])

  const clearSelected = useCallback(() => {
    for (const state of Object.values(concepts.current)) {
      // eslint-disable-next-line no-unused-expressions
      state.node?.classList.remove('selected')
    }
    selected.current.clear()
    toolbar.current.style.display = 'none'
  }, [])

  const openConceptLinkMenu = id => evt => openMenu('concept-link', id, null, evt)

  const openMenu = useCallback((type, id, state, evt) => {
    evt.preventDefault()
    setMenu({
      id,
      typeId: `${type}-${id}`,
      state,
      open: type,
      anchor: {
        left: evt.clientX - 2,
        top: evt.clientY - 4
      }
    })
  }, [])

  const closeMenu = useCallback((id) => {
    if (typeof id === 'string' && menu.id !== id) {
      return
    }
    setMenu({
      ...menu,
      id: null,
      open: false
    })
  }, [menu])

  const closeMenuAnd = (func, ...args) => () => {
    func(...args)
    closeMenu()
  }

  const menuAddLink = useCallback(closeMenuAnd(setAddingLink, menu.id),
    [setAddingLink, menu.id])

  const menuFlipLevel = useCallback(async () => {
    closeMenu()
    await updateConcept({
      variables: {
        id: menu.id,
        level: oppositeLevel[menu.state.concept.level]
      }
    })
  }, [updateConcept, closeMenu, menu.state, menu.id])

  const convertAllSelected = useCallback(async level => {
    const data = Array.from(selected.current).map(id => ({
      id: id.substr('concept-'.length),
      level
    }))
    await updateManyConcepts({
      variables: {
        concepts: data
      }
    })
  }, [updateManyConcepts])

  const menuFlipAllLevel = useCallback(
    closeMenuAnd(convertAllSelected, oppositeLevel[menu.state?.concept?.level]),
    [convertAllSelected, closeMenu, menu.state])

  const menuDeselectConcept = useCallback(() => {
    if (selected.current.has(menu.typeId)) {
      deselectNode(menu.typeId, menu.state)
    } else {
      selectNode(menu.typeId, menu.state)
    }
    closeMenu()
  }, [selectNode, deselectNode, closeMenu, menu.typeId, menu.state])

  const menuDeselectAll = useCallback(closeMenuAnd(clearSelected), [clearSelected])

  const menuDeleteConcept = useCallback(async () => {
    closeMenu()
    if (!await confirmDelete(`Are you sure you want to delete ${menu.state.concept.name}?`)) {
      return
    }
    await deleteConcept({
      variables: {
        id: menu.id
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteConcept, closeMenu, menu])

  const menuDeleteAll = useCallback(async () => {
    closeMenu()
    if (!await confirmDelete('Are you sure you want to delete the selected concepts?')) {
      return
    }
    await deleteManyConcepts({
      variables: {
        ids: Array.from(selected.current).map(id => id.substr('concept-'.length))
      }
    })
    clearSelected()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteManyConcepts, clearSelected, closeMenu])

  const menuDeleteLink = useCallback(async() => {
    closeMenu()
    await deleteConceptLink({
      variables: {
        id: menu.id
      }
    })
  }, [deleteConceptLink, closeMenu, menu.id])

  const menuEditConcept = useCallback(closeMenuAnd(() => openEditConceptDialog(menu.state.concept)),
    [openEditConceptDialog])

  const toolbarConvert = useCallback(() => convertAllSelected(conversionTarget),
    [convertAllSelected, conversionTarget])

  const toolbarEditConcept = useCallback(() => {
    if (selected.current.size !== 1) {
      return
    }
    openEditConceptDialog(concepts.current[selected.current.values().next().value].concept)
  }, [openEditConceptDialog])

  const menuAddNode = useCallback(level => () => {
    closeMenu()
    setTimeout(() => {
      setAdding({
        position: {
          x: ((menu.anchor.left - main.current.offsetLeft + pan.current.x) / pan.current.zoom) - 98,
          y: ((menu.anchor.top - main.current.offsetTop + pan.current.y) / pan.current.zoom) - 13
        },
        level,
        courseId
      })
    }, 0)
  }, [menu.anchor, closeMenu, courseId])

  const menuAddConcept = useCallback(menuAddNode('CONCEPT'), [menuAddNode])
  const menuAddObjective = useCallback(menuAddNode('OBJECTIVE'), [menuAddNode])

  if (courseQuery.error) {
    return <NotFoundView message='Course not found' />
  } else if (!courseQuery.data.courseById) {
    return <LoadingBar id='course-view' />
  }

  const course = courseQuery.data.courseById

  return <>
    <main className={classes.root} ref={main}>
      {course.concepts.flatMap(concept => [
        <ConceptNode
          key={concept.id} workspaceId={workspaceId} concept={concept} pan={pan} concepts={concepts}
          openMenu={openMenu} closeMenu={closeMenu} openConceptDialog={openEditConceptDialog}
          selected={selected} selectNode={selectNode} deselectNode={deselectNode}
          submit={submitExistingConcept} submitAllPosition={submitAllPosition}
        />,
        ...concept.linksToConcept.map(link => <ConceptLink
          key={link.id} delay={1} active linkId={link.id}
          within='concept-mapper-link-container' posOffsets={linkOffsets}
          onContextMenu={openConceptLinkMenu(link.id)}
          scrollParentRef={pan} noListenScroll
          from={`concept-${concept.id}`} to={`concept-${link.from.id}`}
          fromConceptId={concept.id} toConceptId={link.from.id}
          fromAnchor='center middle' toAnchor='center middle'
        />)
      ])}
      {adding && <ConceptNode
        isNew concept={{ id: 'new', name: '', level: 'CONCEPT', ...adding }}
        concepts={concepts} selected={selected}
        cancel={stopAdding} submit={submitNewConcept}
        openConceptDialog={openCreateObjectiveDialog}
      />}
      {addingLink && <ConceptLink
        active within={document.body}
        followMouse from={`concept-${addingLink}`} to={`concept-${addingLink}`}
      />}
      <div ref={selectionRef} className={classes.selection} />
      <div id='concept-mapper-link-container' />
      {course.concepts.length === 0 && !adding && <div className={classes.emptyText}>
        <Typography variant='h3' component='h3'>Double click to add a new concept</Typography>
      </div>}
    </main>

    <section className={classes.toolbar}>
      <CourseList
        courseId={course.id} courses={courseQuery.data.courseById.workspace.courses}
        urlPrefix={urlPrefix} workspaceId={workspaceId}
      />
      <div style={{ display: 'none' }} className={classes.toolbarButtonWrapper} ref={toolbar}>
        <Button
          size='small' variant='outlined' ref={toolbarEditButton} onClick={toolbarEditConcept}
        >
          Edit
        </Button>
        <Button size='small' variant='outlined' onClick={menuDeleteAll}>Delete</Button>
        <Button size='small' variant='outlined' onClick={menuDeselectAll}>Deselect</Button>

        <ButtonGroup size='small' ref={conversionDialogRef} variant='outlined'>
          <Button style={{ borderRight: 'none' }} onClick={toolbarConvert}>
            Convert all to {conversionTarget}
          </Button>
          <Button onClick={() => setConversionDialogOpen(true)}>
            <ArrowDropDownIcon />
          </Button>
        </ButtonGroup>
      </div>
      <div className={classes.sliderWrapper}>
        <HackyStatefulSlider
          orientation='vertical' value={pan.current.linearZoom} hackyRef={hackySliderRef}
          onChange={(_, newValue) => adjustZoom(pan.current.linearZoom - newValue)} max={200}
        />
      </div>
    </section>

    <Menu
      open={conversionDialogOpen} onClose={() => setConversionDialogOpen(false)}
      anchorEl={conversionDialogRef.current}
      getContentAnchorEl={null}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      transformOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      {conversionOptions.map(option => (
        <MenuItem
          key={option}
          selected={option === conversionTarget}
          onClick={() => {
            setConversionTarget(option)
            setConversionDialogOpen(false)
          }}
        >
          {option.toTitleCase()}
        </MenuItem>
      ))}
    </Menu>

    <Menu
      keepMounted anchorReference='anchorPosition' anchorPosition={menu.anchor}
      open={menu.open === 'concept'} onClose={closeMenu}
    >
      <MenuItem onClick={menuAddLink}>Add link</MenuItem>
      <MenuItem onClick={menuEditConcept}>Edit</MenuItem>
      <MenuItem onClick={menuDeleteConcept}>Delete</MenuItem>
      <MenuItem onClick={menuDeselectConcept}>
        {selected.current.has(menu.typeId) ? 'Deselect' : 'Select'}
      </MenuItem>
      <MenuItem onClick={menuFlipLevel}>
        Convert to {oppositeLevel[menu.state?.concept?.level]?.toLowerCase()}
      </MenuItem>
      {selected.current.has(menu.typeId) && selected.current.size > 1 && (
        <div style={{ display: 'contents' }}>
          <Divider component='li' style={{ margin: '4px 0' }} />
          <MenuItem onClick={menuDeselectAll}>Deselect all</MenuItem>
          <MenuItem onClick={menuDeleteAll}>Delete all</MenuItem>
          <MenuItem onClick={menuFlipAllLevel}>
          Convert all to {oppositeLevel[menu.state?.concept?.level]?.toLowerCase()}
          </MenuItem>
        </div>
      )}
    </Menu>
    <Menu
      keepMounted anchorReference='anchorPosition' anchorPosition={menu.anchor}
      open={menu.open === 'concept-link'} onClose={closeMenu}
    >
      <MenuItem onClick={menuDeleteLink}>Delete link</MenuItem>
    </Menu>
    <Menu
      keepMounted anchorReference='anchorPosition' anchorPosition={menu.anchor}
      open={menu.open === 'background'} onClose={closeMenu}
    >
      <MenuItem onClick={menuAddConcept}>Add concept</MenuItem>
      <MenuItem onClick={menuAddObjective}>Add objective</MenuItem>
    </Menu>
  </>
}

export default ConceptMapperView
