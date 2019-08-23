import React, { Component, useRef, useEffect, useLayoutEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'

const defaultAnchor = { x: 0.5, y: 0.5 }

// TODO turn this into a functional component
export default class ConceptLink extends Component {
  // eslint-disable-next-line camelcase
  UNSAFE_componentWillMount() {
    this.fromAnchor = this.parseAnchor(this.props.fromAnchor)
    this.toAnchor = this.parseAnchor(this.props.toAnchor)
    this.delay = this.parseDelay(this.props.delay)
    this.positionChanged = true
  }

  componentDidMount() {
    this.delay = this.parseDelay(this.props.delay)
    if (typeof this.delay !== 'undefined') {
      this.deferUpdate(this.delay)
    }
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.fromAnchor !== this.props.fromAnchor) {
      this.fromAnchor = this.parseAnchor(this.props.fromAnchor)
    }
    if (nextProps.toAnchor !== this.props.toAnchor) {
      this.toAnchor = this.parseAnchor(this.props.toAnchor)
    }
    if (nextProps.from !== this.props.from || nextProps.to !== this.props.to) {
      this.positionChanged = true
    }
    this.delay = this.parseDelay(nextProps.delay)
    if (typeof this.delay !== 'undefined') {
      this.deferUpdate(this.delay)
    }
  }

  shouldComponentUpdate() {
    if (this.positionChanged) {
      this.positionChanged = false
      return true
    }
    return false
  }

  componentWillUnmount() {
    if (this.deferredUpdate) {
      clearTimeout(this.deferredUpdate)
      this.deferredUpdate = null
    }
  }

  // Forced update after delay (MS)
  deferUpdate(delay) {
    if (this.deferredUpdate) {
      clearTimeout(this.deferredUpdate)
    }
    this.deferredUpdate = setTimeout(() => this.forceUpdate(), delay)
  }

  parseDelay(value) {
    if (typeof value === 'undefined') {
      return value
    } else if (typeof value === 'boolean' && value) {
      return 0
    }
    const delay = parseInt(value, 10)
    if (isNaN(delay) || !isFinite(delay)) {
      throw new Error(`LinkTo could not parse delay attribute "${value}"`)
    }
    return delay
  }

  parseAnchorText(value) {
    // Try to infer the relevant axis.
    switch (value) {
    case 'top':
      return { y: 0 }
    case 'left':
      return { x: 0 }
    case 'middle':
      return { y: 0.5 }
    case 'center':
      return { x: 0.5 }
    case 'bottom':
      return { y: 1 }
    case 'right':
      return { x: 1 }
    default:
      return {}
    }
  }

  parseAnchor(value) {
    if (!value) {
      return defaultAnchor
    }
    if (typeof value === 'object') {
      return value
    }
    const parts = value.split(' ')
    if (parts.length > 2) {
      throw new Error('LinkTo anchor format is "<x> <y>"')
    }
    const [x, y] = parts
    return { ...defaultAnchor, ...this.parseAnchorText(x), ...this.parseAnchorText(y) }
  }

  detect() {
    const { from: fromId, to: toId } = this.props

    const from = document.getElementById(fromId)
    const to = document.getElementById(toId)
    if (!from || !to) {
      return false
    }

    const offset = { x0: 0, y0: 0, x1: 0, y1: 0, ...this.props.posOffsets }

    return () => {
      const fromBox = from.getBoundingClientRect()
      const toBox = to.getBoundingClientRect()

      const x0 = fromBox.x + fromBox.width * this.fromAnchor.x + window.pageXOffset + offset.x0
      const y0 = fromBox.y + fromBox.height * this.fromAnchor.y + window.pageYOffset + offset.y0
      const x1 = toBox.x + toBox.width * this.toAnchor.x + window.pageXOffset + offset.x1
      const y1 = toBox.y + toBox.height * this.toAnchor.y + window.pageYOffset + offset.y1

      return { x0, y0, x1, y1 }
    }
  }

  render() {
    const points = this.detect()
    return points ? <Line {...points()} refreshPoints={points} {...this.props} /> : null
  }
}

const useLineStyles = makeStyles({
  linetoPlaceholder: {
    display: 'none'
  },
  linetoHover: {
    '&:hover': {
      backgroundColor: 'rgba(245, 0, 87, 0.25)'
    }
  },
  linetoWrapper: {
    '&:not(.linetoActive)': {
      pointerEvents: 'none'
    },
    '&.linetoActive:before': {
      borderRightColor: 'red'
    },
    '&:before': {
      content: '""',
      position: 'absolute',
      top: '50%',
      right: '50%',
      width: 0,
      height: 0,

      borderWidth: '7px',
      borderStyle: 'solid',
      borderColor: 'transparent #eaeaea transparent transparent',
      marginTop: '-7px'
    }
  },
  linetoLine: {
    position: 'absolute',
    pointerEvents: 'none',
    borderTop: '3px solid rgba(117, 117, 117, 0.15)',
    '&.linetoActive': {
      borderTopColor: '#f50057'
    }
  }
})

const Line = ({
  x0, y0, x1, y1, from, to, followMouse, within = '', refreshPoints, onContextMenu, linkRef, zIndex,
  active, attributes, linkId
}) => {
  const classes = useLineStyles()
  const el = useRef(null)

  const dyn = useRef({ x: null, y: null })
  const pos = useRef({ x0, y0, x1, y1 })

  const calculate = () => {
    const { x0, y0, x1, y1 } = pos.current
    const dy = (dyn.current.y || y1) - y0
    const dx = (dyn.current.x || x1) - x0
    const angle = Math.atan2(dy, dx) * 180 / Math.PI
    const length = Math.sqrt(dx * dx + dy * dy)
    return { x: x0, y: y0, angle, length }
  }

  const recalculate = () => {
    const { x, y, angle, length } = calculate()

    if (!el.current) {
      return
    }

    el.current.style.top = `${y}px`
    el.current.style.left = `${x}px`
    el.current.style.transform = `rotate(${angle}deg)`
    el.current.style.width = `${length}px`
    for (const elem of el.current.getElementsByTagName('div')) {
      elem.style.width = `${length}px`
    }
  }

  const handleMouse = evt => {
    dyn.current.x = evt.pageX - 1
    dyn.current.y = evt.pageY - 5
    recalculate()
  }

  const handleResize = () => {
    pos.current = refreshPoints()
    recalculate()
  }

  const elCallback =node => {
    el.current = node
    if (linkRef) {
      linkRef.current = node
    }
  }

  // componentWillReceiveProps
  useEffect(() => {
    pos.current = { x0, y0, x1, y1 }
  }, [x0, y0, x1, y1])

  // componentWillMount
  useEffect(() => {
    window.addEventListener('resize', handleResize)
    window.addEventListener('redrawConceptLink', handleResize)
    window.addEventListener('scroll', handleResize, true)
    // componentWillUnmount
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('redrawConceptLink', handleResize)
      window.removeEventListener('scroll', handleResize)
    }
  }, [])

  const withinEl = within ? document.getElementById(within) : document.body

  // componentDidMount
  useLayoutEffect(() => {
    withinEl.appendChild(el.current)
    if (followMouse) {
      withinEl.addEventListener('mousemove', handleMouse)
    }
    // componentWillUnmount
    return () => {
      withinEl.removeChild(el.current)
      if (followMouse) {
        withinEl.removeEventListener('mousemove', handleMouse)
      }
    }
  }, [])

  const { x, y, angle, length } = calculate()

  const commonStyle = {
    position: 'absolute',
    width: `${length}px`,
    zIndex: zIndex || 1
  }

  const wrapperStyle = {
    ...commonStyle,
    top: `${y}px`,
    left: `${x}px`,
    height: '1px',
    transform: `rotate(${angle}deg)`,
    // Rotate around (x0, y0)
    transformOrigin: '0 0'
  }

  const lineWidth = 3
  const innerStyle = {
    ...commonStyle,
    top: 0,
    left: 0,
    transform: `translateY(-${Math.floor(lineWidth / 2)}px)`
  }

  const hoverAreaWidth = 15
  const hoverAreaOffset = 10

  const hoverAreaStyle = {
    ...commonStyle,
    position: 'relative',
    width: `${length - hoverAreaOffset * 2}px`,
    height: `${hoverAreaWidth}px`,
    color: 'transparent',
    transform: `translateX(${hoverAreaOffset}px) translateY(-${Math.floor(hoverAreaWidth / 2)}px)`
  }

  // We need a wrapper element to prevent an exception when then
  // React component is removed. This is because we manually
  // move the rendered DOM element after creation.
  return (
    <div
      className={classes.linetoPlaceholder} data-link-from={from} data-link-to={to} {...attributes}
    >
      <div
        className={`${classes.linetoWrapper} ${active && !followMouse ? 'linetoActive' : ''}`}
        ref={elCallback} style={wrapperStyle}
      >
        {(active && !followMouse) &&
          <div
            style={hoverAreaStyle} className={classes.linetoHover}
            onContextMenu={evt => onContextMenu(evt, linkId)}
            onClick={evt => onContextMenu(evt, linkId)}
          />
        }
        <div
          style={innerStyle}
          className={`${classes.linetoLine} ${active ? 'linetoActive' : ''}`}
        />
      </div>
    </div>
  )
}
