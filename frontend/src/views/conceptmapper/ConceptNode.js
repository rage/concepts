import React, { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { DraggableCore } from 'react-draggable'

import { noPropagation } from '../../lib/eventMiddleware'

const useStyles = makeStyles(theme => ({
  root: {
    position: 'absolute',
    padding: '5px',
    backgroundColor: 'white',
    borderRadius: '4px',
    cursor: 'pointer',
    boxSizing: 'border-box',
    border: '1px solid gray',
    overflow: 'hidden',
    '&.selected': {
      border: '2px solid red',
      padding: '4px'
    }
  },
  editing: {
    resize: 'both',
    padding: 0,
    '&.selected > $textarea': {
      padding: '4px'
    }
  },
  textarea: {
    padding: '5px',
    width: '100%',
    height: '100%',
    border: 'none',
    margin: 0,
    overflowY: 'auto',
    scrollbarWidth: 'thin',
    // Text inputs need font settings to be overridden
    ...theme.typography.body2
  }
}))

const parsePosition = position => {
  if (!position) {
    return [{ x: 0, y: 0 }, { maxHeight: 60, maxWidth: 400, width: 'auto', height: 'auto' }]
  } else if (typeof position !== 'string') {
    return position
  }
  const [x, y, w, h] = position.split(',')
  return [{
    x: parseInt(x) || 0,
    y: parseInt(y) || 0
  }, {
    width: parseInt(w) || 0,
    height: parseInt(h) || 0
  }]
}

const ConceptNode = ({
  concept, concepts, selected,
  submit, cancel, isNew = false
}) => {
  const classes = useStyles()
  const [editing, setEditing] = useState(isNew)
  const [name, setName] = useState(concept.name)
  const node = useRef()
  const textArea = useRef()
  const pos = useRef()
  const size = useRef()
  const prevPosition = useRef()
  const isResizing = useRef(false)
  const id = `concept-${concept.id}`

  if (concept.position !== prevPosition.current) {
    [pos.current, size.current] = parsePosition(concept.position)
    concepts.current[id] = { ...pos.current, ...size.current, name, node }
    prevPosition.current = concept.position
  }

  useEffect(() => {
    window.addEventListener('moveConcept', handleMoveEvent)
    return () => {
      window.removeEventListener('moveConcept', handleMoveEvent)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useLayoutEffect(() => {

  }, [])

  const updatePos = ({ deltaX, deltaY }) => {
    pos.current.x += deltaX
    pos.current.y += deltaY
    node.current.style.left = `${pos.current.x}px`
    node.current.style.top = `${pos.current.y}px`
    concepts.current[id].x = pos.current.x
    concepts.current[id].y = pos.current.y
  }

  const handleMoveEvent = evt => evt.detail.id !== id
    && selected.current.has(evt.detail.id) && selected.current.has(id)
    && updatePos(evt.detail)

  if (editing) {
    const onChange = evt => {
      setName(evt.target.value)
      concepts.current[id].name = evt.target.value
    }

    const onResizeStart = evt => isResizing.current = evt.target === node.current
    const onResize = () => {
      if (isResizing.current) {
        size.current.width = node.current.offsetWidth
        size.current.height = node.current.offsetHeight
        concepts.current[id].width = size.current.width
        concepts.current[id].height = size.current.height
      }
    }
    const onResizeStop = () => {
      isResizing.current = false
      concepts.current[id] = { ...pos.current, ...size.current, name, node }
    }

    const onKeyDown = evt => {
      if (evt.key === 'Enter' && !evt.shiftKey) {
        finishEdit()
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
      await submit({
        name,
        position: `${pos.current.x},${pos.current.y},${size.current.width},${size.current.height}`
      })
      if (!isNew) {
        setEditing(false)
      }
    }

    return (
      <div
        ref={node} className={`${classes.root} ${classes.editing}`} id={id}
        style={{ left: pos.current.x, top: pos.current.y, ...size.current }}
        onMouseDown={onResizeStart} onMouseMove={onResize} onMouseUp={onResizeStop}
      >
        <textarea
          ref={textArea} className={classes.textarea} onChange={onChange} onBlur={finishEdit}
          onKeyDown={onKeyDown} value={name} autoFocus
        />
      </div>
    )
  } else {
    const onDrag = (evt, { deltaX, deltaY }) => {
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
      submit({
        position: `${pos.current.x},${pos.current.y},${size.current.width},${size.current.height}`
      })
    }

    return (
      <DraggableCore onDrag={onDrag} onStop={onDragStop}>
        <div
          ref={node} className={classes.root} id={id}
          onDoubleClick={noPropagation(() => setEditing(true))}
          style={{ left: pos.current.x, top: pos.current.y, ...size.current }}
        >
          {concept.name}
        </div>
      </DraggableCore>
    )
  }
}

export default ConceptNode
