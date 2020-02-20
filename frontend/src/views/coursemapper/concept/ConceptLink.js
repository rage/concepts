import React, { Component, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'

const defaultAnchor = { x: 0.5, y: 0.5 }

const container = document.getElementById('link-container')

// TODO turn this into a functional component
export default class ConceptLink extends Component {
  constructor(props) {
    super(props)
    this.fromRef = React.createRef()
    this.toRef = React.createRef()
  }

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
    const {
      from: fromId, to: toId, scrollParentRef, scrollParentFromRef, scrollParentToRef, followMouse
    } = this.props

    const fromRef = this.fromRef
    const toRef = this.toRef

    fromRef.current = document.getElementById(fromId)
    toRef.current = document.getElementById(toId)
    if (!followMouse && (!fromRef.current || !toRef.current)) {
      return false
    }

    const offset = { x0: 0, y0: 0, x1: 0, y1: 0, ...this.props.posOffsets }

    return () => {
      const calculatePosition = (spRef, ref, anchor, dir) => {
        if (!ref.current) {
          return [undefined, undefined]
        }
        const sp = (spRef !== undefined ? spRef : scrollParentRef)?.current
        const pageXOffset = sp ? sp.scrollLeft || sp.x : window.pageXOffset
        const pageYOffset = sp ? sp.scrollTop || sp.y : window.pageYOffset
        const zoom = sp?.zoom || 1
        const box = ref.current.getBoundingClientRect()
        ref.current.classList.add(`linkto-${this.props[`${dir}ConceptId`]}`)
        const index = dir === 'to' ? 0 : 1
        return [
          (box.x + (box.width * anchor.x) + pageXOffset + offset[`x${index}`]) / zoom,
          (box.y + (box.height * anchor.y) + pageYOffset + offset[`y${index}`]) / zoom
        ]
      }

      const [x0, y0] = calculatePosition(scrollParentFromRef, fromRef, this.fromAnchor, 'from')
      const [x1, y1] = calculatePosition(scrollParentToRef, toRef, this.toAnchor, 'to')

      return { x0, y0, x1, y1 }
    }
  }

  render() {
    const points = this.detect()
    return points ? <Line {...points()} refreshPoints={points} {...this.props} /> : null
  }
}

const useStyles = makeStyles({
  placeholder: {
    display: 'none'
  },
  hover: {
    '&:hover': {
      backgroundColor: 'rgba(245, 0, 87, 0.25)'
    }
  },
  wrapper: {
    '&:not($activeWrapper)': {
      pointerEvents: 'none'
    },
    '&:before': {
      content: '""',
      position: 'absolute',
      top: '50%',
      right: 'calc(50% - 11px)',
      width: 0,
      height: 0,

      borderWidth: '7px',
      borderStyle: 'solid',
      borderColor: 'transparent transparent transparent #f1f1f1',
      marginTop: '-7px'
    }
  },
  line: {
    position: 'absolute',
    pointerEvents: 'none',
    borderTop: '3px solid rgba(117, 117, 117, 0.1)'
  },
  activeLine: {
    borderTopColor: '#f50057'
  },
  activeWrapper: {
    '&:before': {
      borderLeftColor: 'red'
    }
  }
})

const Line = ({
  x0, y0, x1, y1, from, to, followMouse, within, refreshPoints, onContextMenu, linkRef, zIndex,
  active, attributes, text, linkId, classes: propClasses, noListenScroll = false, editing, stopEdit,
  weight
}) => {
  const classes = useStyles({ classes: propClasses })
  const el = useRef(null)
  const [editText, setEditText] = useState(text || '')

  const dyn = useRef({ x: null, y: null })
  const pos = useRef({ x0, y0, x1, y1 })

  const calculate = () => {
    let { x0: x, y0: y, x1: dx, y1: dy } = pos.current
    if (dyn.current.x) {
      if (!x && !y) {
        x = dyn.current.x
        y = dyn.current.y
      } else {
        dx = dyn.current.x
        dy = dyn.current.y
      }
    }
    dx -= x
    dy -= y
    const angle = Math.atan2(dy, dx) * 180 / Math.PI
    const length = Math.sqrt((dx * dx) + (dy * dy))
    return { x, y, angle, length }
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
    const text = el.current.getElementsByClassName('link-text-rotate')[0]
    text.style.transform = Math.abs(angle) > 90 ? 'rotate(180deg)' : 'translateY(-25px)'
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

  const handleConceptMoveEvent = evt => {
    let changed = false, bothChanged = false
    if (evt.detail.id === from || (evt.detail.selected && evt.detail.selected.has(from))) {
      pos.current.x0 += evt.detail.deltaX
      pos.current.y0 += evt.detail.deltaY
      changed = true
    }
    if (evt.detail.id === to || (evt.detail.selected && evt.detail.selected.has(to))) {
      pos.current.x1 += evt.detail.deltaX
      pos.current.y1 += evt.detail.deltaY
      bothChanged = changed
      changed = true
    }
    if (bothChanged) {
      // Don't even bother with the angle recalculation
      el.current.style.top = `${pos.current.y0}px`
      el.current.style.left = `${pos.current.x0}px`
    } else if (changed) {
      recalculate()
    }
  }

  const elCallback = node => {
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
    window.addEventListener('resizeConcept', handleConceptMoveEvent)
    window.addEventListener('moveConcept', handleConceptMoveEvent)
    if (!noListenScroll) {
      window.addEventListener('scroll', handleResize, true)
    }
    // componentWillUnmount
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('redrawConceptLink', handleResize)
      window.removeEventListener('resizeConcept', handleConceptMoveEvent)
      window.removeEventListener('moveConcept', handleConceptMoveEvent)
      if (!noListenScroll) {
        window.removeEventListener('scroll', handleResize)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  within = (typeof within === 'string' ? document.getElementById(within) : within) || container

  // componentDidMount
  useLayoutEffect(() => {
    within.appendChild(el.current)
    if (followMouse) {
      within.addEventListener('mousemove', handleMouse)
    }
    // componentWillUnmount
    return () => {
      within.removeChild(el.current)
      if (followMouse) {
        within.removeEventListener('mousemove', handleMouse)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const lineWidth = Math.min(Math.max(weight / 25, 1), 7) - 1
  const innerStyle = {
    ...commonStyle,
    top: 0,
    left: 0,
    transform: `translateY(-${Math.floor(lineWidth / 2)}px)`,
    borderTopWidth: lineWidth
  }

  const hoverAreaWidth = 12 + lineWidth
  const hoverAreaOffset = 10

  const hoverAreaStyle = {
    ...commonStyle,
    position: 'relative',
    width: `${length - (hoverAreaOffset * 2)}px`,
    height: `${hoverAreaWidth}px`,
    color: 'transparent',
    transform: `translateX(${hoverAreaOffset}px) translateY(-${Math.floor(hoverAreaWidth / 2)}px)`
  }

  const textStyle = {
    display: 'block',
    transform: Math.abs(angle) > 90 ? 'rotate(180deg)' : 'translateY(-25px)',
    width: '100%',
    textAlign: 'center',
    color: active ? 'inherit' : 'rgba(117, 117, 117, 0.5)',

    lineHeight: '20px',
    letterSpacing: '0.15px',
    fontSize: '14px'
  }

  const textEditStyle = {
    ...textStyle,
    border: 'none',
    background: 'none',
    pointerEvents: 'initial',

    lineHeight: '18px'
  }

  const editKeyDown = evt => {
    if (evt.key === 'Enter' && !evt.shiftKey) {
      evt.preventDefault()
      stopEdit(linkId, editText)
    } else if (evt.key === 'Escape') {
      editBlur()
    }
  }

  const editBlur = () => {
    stopEdit(linkId)
    setEditText(text)
  }

  // We need a wrapper element to prevent an exception when then
  // React component is removed. This is because we manually
  // move the rendered DOM element after creation.
  return (
    <div className={classes.placeholder} data-link-from={from} data-link-to={to} {...attributes}>
      <div
        className={`${classes.wrapper} ${active && !followMouse ? classes.activeWrapper : ''}`}
        ref={elCallback} style={wrapperStyle}
      >
        {(active && !followMouse) &&
          <div
            style={hoverAreaStyle} className={classes.hover}
            onContextMenu={evt => onContextMenu(evt, linkId, weight)}
            onClick={evt => onContextMenu(evt, linkId, weight)}
          />
        }
        <div style={innerStyle} className={`${classes.line} ${active ? classes.activeLine : ''}`}>
          {editing
            ? (
              <input
                className='link-text-rotate' style={textEditStyle} placeholder='Enter link text'
                value={editText} onChange={evt => setEditText(evt.target.value)} autoFocus
                onKeyDown={editKeyDown} onBlur={editBlur}
              />
            ) : <span className='link-text-rotate' style={textStyle}>{text}</span>}
        </div>
      </div>
    </div>
  )
}
