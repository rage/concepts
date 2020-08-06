import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { IconButton, Tooltip } from '@material-ui/core'
import { ZoomOutMap } from '@material-ui/icons'
import { DraggableCore } from 'react-draggable'

const useStyles = makeStyles(theme => ({
  root: {
    position: 'absolute',
    padding: '6px',
    backgroundColor: 'white',
    borderRadius: '4px',
    cursor: 'pointer',
    boxSizing: 'border-box',
    border: '1px solid gray',
    whiteSpace: 'pre-wrap',
    overflow: 'hidden',
    '&:hover:not(.selected)': {
      border: '2px solid limegreen',
      padding: '5px',
      '&$objective': {
        border: '2px solid blue'
      }
    },
    '&.selected': {
      border: '3px solid limegreen',
      padding: '4px',
      '&$objective': {
        border: '3px solid blue'
      }
    },
    // Put these above the links
    zIndex: 5
  },
  concept: {},
  objective: {
    backgroundColor: 'lightblue'
  },
  editing: {
    resize: 'both',
    padding: '0 !important',
    '&:hover:not(.selected) > $textarea': {
      padding: '5px'
    },
    '&.selected > $textarea': {
      padding: '4px'
    }
  },
  editExpandButton: {
    position: 'absolute'
  },
  textarea: {
    resize: 'none',
    padding: '6px',
    width: '100%',
    height: '100%',
    border: 'none',
    margin: 0,
    overflow: 'hidden',
    // Text inputs need font settings to be overridden
    ...theme.typography.body2
  }
}))

const parsePosition = position => {
  if (!position) {
    return { x: 0, y: 0, width: 200, height: 34 }
  } else if (typeof position !== 'string') {
    return {
      x: position.x || 0,
      y: position.y || 0,
      width: position.width || 200,
      height: position.height || 34
    }
  }
  const [x, y, w, h] = position.split(',')
  return {
    x: parseInt(x) || 0,
    y: parseInt(y) || 0,
    width: parseInt(w) || 200,
    height: parseInt(h) || 34
  }
}

const ConceptNode = ({
  concept, concepts, selected, selectNode, deselectNode, pan,
  openMenu, closeMenu, submit, submitAllPosition, cancel, isNew = false,
  openConceptDialog
}) => {
  const classes = useStyles()
  const [editing, setEditing] = useState(isNew)
  const [name, setName] = useState(concept.name)
  const [importance, setImportance] = useState(0)
  const id = `concept-${concept.id}`

  const getImportance = () => {
    let value = 0
    for (const v of Object.values(concepts?.current)) {
      for (const link of v.concept.linksToConcept) {
        if (link.from.id == concept.id) value++;
      }
    }
    return Math.min(Math.max(0, value - 1), 10)
  }

  useEffect(() => {
    if (name !== concept.name) {
      setName(concept.name)
    }
    setImportance(getImportance())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [concept.name, concepts])

  if (!concepts.current[id]) concepts.current[id] = { name }
  const self = concepts.current[id]
  self.concept = concept

  if (concept.position !== self.prevPosition) {
    const pos = parsePosition(concept.position)
    const [oldX, oldY, oldWidth, oldHeight] = [self.x, self.y, self.width, self.height]
    Object.assign(self, pos)
    self.position = `${self.x},${self.y},${self.width},${self.height}`
    self.prevPosition = concept.position
    const deltaX = self.x - oldX + ((self.width - oldWidth) / 2)
    const deltaY = self.y - oldY + ((self.height - oldHeight) / 2)
    if (deltaX !== 0 || deltaY !== 0) {
      window.dispatchEvent(new CustomEvent('resizeConcept', {
        detail: {
          id,
          deltaX,
          deltaY
        }
      }))
    }
  }

  useEffect(() => {
    window.addEventListener('moveConcept', handleMoveEvent)
    return () => {
      window.removeEventListener('moveConcept', handleMoveEvent)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updatePos = ({ deltaX, deltaY }) => {
    self.x += deltaX
    self.y += deltaY
    self.node.style.left = `${self.x}px`
    self.node.style.top = `${self.y}px`
    self.position = `${self.x},${self.y},${self.width},${self.height}`
  }

  const handleMoveEvent = evt => evt.detail.id !== id
    && selected.current.has(evt.detail.id) && selected.current.has(id)
    && updatePos(evt.detail)

  const positionStyle = {
    left: self.x,
    top: self.y,
    width: self.width,
    height: self.height
  }

  if (editing) {
    const onChange = evt => {
      setName(evt.target.value)
      self.name = evt.target.value
      const paddingX = self.node.offsetWidth - self.textArea.offsetWidth
      const paddingY = self.node.offsetHeight - self.textArea.offsetHeight
      resize(self.textArea.scrollWidth + paddingX, self.textArea.scrollHeight + paddingY)
    }

    const resize = (width, height) => {
      const deltaX = (width - self.width) / 2
      const deltaY = (height - self.height) / 2
      self.width = width
      self.height = height
      self.position = `${self.x},${self.y},${self.width},${self.height}`
      self.expandButton.style.left = `${self.x + self.width + 4}px`
      self.expandButton.style.top = `${self.y + (self.height / 2) - 15}px`

      window.dispatchEvent(new CustomEvent('resizeConcept', {
        detail: {
          id,
          deltaX,
          deltaY
        }
      }))
    }

    const onResizeStart = evt => self.isResizing = evt.target === self.node
    const onResize = () => {
      if (self.isResizing &&
          (self.width !== self.node.offsetWidth
          || self.height !== self.node.offsetHeight)) {
        resize(self.node.offsetWidth, self.node.offsetHeight)
      }
    }
    const onResizeStop = () => self.isResizing = false

    const onKeyDown = evt => {
      if (evt.key === 'Enter' && !evt.shiftKey) {
        finishEdit()
        evt.preventDefault()
      } else if (evt.key === 'Escape') {
        cancelEdit()
      }
    }

    const cancelEdit = () => {
      if (cancel) {
        cancel()
      }
      if (!isNew) {
        if (name !== concept.name) {
          setName(concept.name)
        }
        setEditing(false)
      }
    }

    const finishEdit = evt => {
      if (evt && evt.relatedTarget === self.expandButton) {
        return
      }
      const trimmedName = name.trim()
      if (trimmedName.length === 0 || trimmedName === concept.name) {
        cancelEdit()
        return
      }
      submit(concept.id, {
        name: trimmedName,
        position: self.position
      }).then(() => {
        if (!isNew) {
          setEditing(false)
        }
      })
    }

    const expandEdit = () => {
      cancelEdit()
      // TODO we should reset self.position and related fields here, since if the user cancels the
      //      edit dialog, the resizing will never be saved on the server.
      openConceptDialog({ ...self.concept, position: self.position, name })
    }

    const expandButtonStyle = {
      left: positionStyle.left + positionStyle.width + 4,
      top: positionStyle.top + (positionStyle.height / 2) - 15
    }

    return <>
      <div
        ref={node => self.node = node} style={positionStyle} id={id}
        className={`${classes.root} ${classes[concept.level.toLowerCase()]} ${classes.editing}
          ${selected.current.has(id) ? 'selected' : ''}`}
        onMouseDown={onResizeStart} onMouseMove={onResize} onMouseUp={onResizeStop}
      >
        <textarea
          ref={ta => self.textArea = ta} className={classes.textarea} value={name} autoFocus
          onChange={onChange} onBlur={finishEdit} onKeyDown={onKeyDown}
        />
      </div>
      <IconButton
        ref={btn => self.expandButton = btn} size='small' className={classes.editExpandButton}
        style={expandButtonStyle} onClick={expandEdit}
      >
        <ZoomOutMap />
      </IconButton>
    </>
  } else {
    const onDrag = (evt, { deltaX, deltaY }) => {
      deltaX /= pan.current.zoom
      deltaY /= pan.current.zoom
      window.dispatchEvent(new CustomEvent('moveConcept', {
        detail: {
          id,
          selected: selected.current.has(id) ? selected.current : null,
          deltaX,
          deltaY
        }
      }))
      updatePos({ deltaX, deltaY })
    }

    const onDragStop = () => {
      if (selected.current.has(id)) {
        submitAllPosition()
      } else {
        submit(concept.id, {
          position: self.position
        })
      }
      self.node.style.removeProperty('z-index')
    }

    const onDragStart = evt => {
      if (evt.shiftKey) {
        if (selected.current.has(id)) {
          deselectNode(id, self)
        } else {
          selectNode(id, self)
        }
        return false
      }
      // Always put concepts being dragged at top
      self.node.style.zIndex = '10'
    }

    const startEditing = evt => {
      evt.stopPropagation()
      closeMenu(concept.id)
      setEditing(true)
    }

    // -- Importance of the concept
    positionStyle.boxShadow = `0px 0px ${importance}px ${importance}px rgba(0, 0, 200, 0.75)`

    return (
      <DraggableCore onDrag={onDrag} onStop={onDragStop} onStart={onDragStart}>
        <Tooltip arrow title={concept.description} enterDelay={750} enterNextDelay={750}>
          <div
            ref={node => self.node = node} id={id}
            className={`${classes.root} ${classes[concept.level.toLowerCase()]} concept-root
            ${selected.current.has(id) ? 'selected' : ''}`}
            data-concept-id={concept.id} style={positionStyle} onDoubleClick={startEditing}
            onContextMenu={evt => openMenu('concept', concept.id, self, evt)}
          >
            {concept.name}
          </div>
        </Tooltip>
      </DraggableCore>
    )
  }
}

export default ConceptNode
