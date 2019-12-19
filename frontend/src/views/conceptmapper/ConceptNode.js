import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
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
  textarea: {
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
  openMenu, closeMenu, submit, submitAllPosition, cancel, isNew = false
}) => {
  const classes = useStyles()
  const [editing, setEditing] = useState(isNew)
  const [name, setName] = useState(concept.name)
  const id = `concept-${concept.id}`

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
        setEditing(false)
      }
    }

    const finishEdit = async () => {
      const trimmedName = name.trim()
      if (trimmedName.length === 0) {
        cancelEdit()
        return
      }
      await submit(concept.id, {
        name: trimmedName,
        position: self.position
      })
      if (!isNew) {
        setEditing(false)
      }
    }

    return (
      <div
        ref={node => self.node = node} style={positionStyle} id={id}
        className={`${classes.root} ${classes[concept.level.toLowerCase()]} ${classes.editing}`}
        onMouseDown={onResizeStart} onMouseMove={onResize} onMouseUp={onResizeStop}
      >
        <textarea
          ref={ta => self.textArea = ta} className={classes.textarea} value={name} autoFocus
          onChange={onChange} onBlur={finishEdit} onKeyDown={onKeyDown}
        />
      </div>
    )
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
    }

    const startEditing = evt => {
      evt.stopPropagation()
      closeMenu(concept.id)
      setEditing(true)
    }

    return (
      <DraggableCore onDrag={onDrag} onStop={onDragStop} onStart={onDragStart}>
        <div
          ref={node => self.node = node} id={id}
          className={`${classes.root} ${classes[concept.level.toLowerCase()]} concept-root`}
          data-concept-id={concept.id} style={positionStyle} onDoubleClick={startEditing}
          onContextMenu={evt => openMenu('concept', concept.id, self, evt)}
        >
          {concept.name}
        </div>
      </DraggableCore>
    )
  }
}

export default ConceptNode
