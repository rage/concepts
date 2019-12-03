import React, { useRef, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { DraggableCore } from 'react-draggable'

const useStyles = makeStyles({
  root: {
    position: 'absolute',
    padding: '5px',
    backgroundColor: 'white',
    borderRadius: '4px',
    cursor: 'pointer',
    boxSizing: 'border-box',
    border: '1px solid gray'
  }
})

const parsePosition = position => {
  if (!position) {
    return [{ x: 0, y: 0 }, { width: 300, height: 30 }]
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

const ConceptNode = ({ concept, concepts, selected }) => {
  const classes = useStyles()
  const node = useRef()
  const pos = useRef()
  const size = useRef()
  const id = `concept-${concept.id}`

  useEffect(() => {
    [pos.current, size.current] = parsePosition(concept.position)
    concepts.current[id] = { ...pos.current, ...size.current, node }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [concept.position])

  useEffect(() => {
    window.addEventListener('moveConcept', handleMoveEvent)
    return () => {
      window.removeEventListener('moveConcept', handleMoveEvent)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updatePos = ({ deltaX, deltaY }) => {
    pos.current.x += deltaX
    pos.current.y += deltaY
    node.current.style.left = `${pos.current.x}px`
    node.current.style.top = `${pos.current.y}px`
    concepts.current[id] = { ...pos.current, ...size.current, node }
  }

  const handleMoveEvent = evt => evt.detail.id !== id
    && selected.current.has(evt.detail.id) && selected.current.has(id)
    && updatePos(evt.detail)

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

  const onStop = (evt, { x, y }) => {
    console.log(concept.id, 'moved to', x, y)
  }

  return <DraggableCore onDrag={onDrag} onStop={onStop}>
    <div ref={node} className={classes.root} style={{ ...pos.current, ...size.current }} id={id}>
      {concept.name}
    </div>
  </DraggableCore>
}

export default ConceptNode
