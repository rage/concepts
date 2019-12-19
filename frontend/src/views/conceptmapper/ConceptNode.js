import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { DraggableCore } from 'react-draggable'

import { noPropagation, noDefault } from '../../lib/eventMiddleware'

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
    '&:hover': {
      border: '1px solid red'
    },
    '&.selected': {
      border: '3px solid red',
      padding: '4px'
    },
    // Put these above the links
    zIndex: 5
  },
  editing: {
    resize: 'both',
    padding: 0,
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
  concept, concepts, selected, pan,
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
    Object.assign(self, pos)
    self.prevPosition = concept.position
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
      await submit({
        name: trimmedName,
        position: self.position
      })
      if (!isNew) {
        setEditing(false)
      }
    }

    return (
      <div
        ref={node => self.node = node} className={`${classes.root} ${classes.editing}`} id={id}
        style={positionStyle}
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
        submit({
          position: self.position
        })
      }
    }

    const onDragStart = evt => {
      if (evt.shiftKey) {
        if (selected.current.has(id)) {
          selected.current.delete(id)
          self.node.classList.remove('selected')
        } else {
          selected.current.add(id)
          self.node.classList.add('selected')
        }
        return false
      }
    }

    const startEditing = () => {
      closeMenu()
      setEditing(true)
    }

    return (
      <DraggableCore onDrag={onDrag} onStop={onDragStop} onStart={onDragStart}>
        <div
          ref={node => self.node = node} className={`${classes.root} concept-root`} id={id}
          data-concept-id={concept.id} style={positionStyle}
          onDoubleClick={noPropagation(startEditing)} onContextMenu={noDefault(openMenu)}
        >
          {concept.name}
        </div>
      </DraggableCore>
    )
  }
}

export default ConceptNode
