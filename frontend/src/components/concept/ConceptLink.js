import React, { Component, PureComponent } from 'react'

import { withStyles } from '@material-ui/core/styles'

const defaultAnchor = { x: 0.5, y: 0.5 }
const defaultWrapperWidth = 11

export default class ConceptLink extends Component {
  componentWillMount() {
    this.fromAnchor = this.parseAnchor(this.props.fromAnchor)
    this.toAnchor = this.parseAnchor(this.props.toAnchor)
    this.delay = this.parseDelay(this.props.delay)
    this.positionChanged = true
    this.prevRedrawLines = 0
  }

  componentDidMount() {
    this.delay = this.parseDelay(this.props.delay)
    if (typeof this.delay !== 'undefined') {
      this.deferUpdate(this.delay)
    }
  }

  componentWillReceiveProps(nextProps) {
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
    if (this.props.redrawLines !== this.prevRedrawLines) {
      this.prevRedrawLines = this.props.redrawLines
      return true
    }
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
    return Object.assign({}, defaultAnchor, this.parseAnchorText(x), this.parseAnchorText(y))
  }

  detect() {
    const { from: fromId, to: toId } = this.props

    const from = document.getElementById(fromId)
    const to = document.getElementById(toId)
    if (!from || !to) {
      return false
    }

    return () => {
      const fromBox = from.getBoundingClientRect()
      const toBox = to.getBoundingClientRect()

      const x0 = fromBox.x + fromBox.width * this.fromAnchor.x + window.pageXOffset
      const y0 = fromBox.y + fromBox.height * this.fromAnchor.y + window.pageYOffset
      const x1 = toBox.x + toBox.width * this.toAnchor.x + window.pageXOffset
      const y1 = toBox.y + toBox.height * this.toAnchor.y + window.pageYOffset

      return { x0: x0 - 1, y0, x1: x1 + 2, y1 }
    }
  }

  render() {
    const points = this.detect()
    return points ? (
      <StyledLine {...points()} refreshPoints={points} {...this.props}/>
    ) : null
  }
}

const lineStyles = theme => ({
  linetoHover: {
    '&:hover': {
      backgroundColor: 'rgba(255, 0, 0, 0.25)'
    }
  },
  linetoWrapper: {
    '&:not(.linetoActive)': {
      pointerEvents: 'none'
    }
  },
  linetoLine: {
    position: 'absolute',
    pointerEvents: 'none',
    borderTop: '1px solid rgba(117, 117, 117, 0.15)',
    '&.linetoActive': {
      borderTopColor: '#f50057'
    }
  }
})

export class Line extends PureComponent {
  constructor(props) {
    super(props)
    this.el = React.createRef()
    this.handleMouse = this.handleMouse.bind(this)
    this.handleResize = this.handleResize.bind(this)
    this.pos = {
      x0: this.props.x0,
      y0: this.props.y0,
      x1: this.props.x1,
      y1: this.props.y1
    }
    this.dynX = null
    this.dynY = null
  }

  componentWillReceiveProps(nextProps) {
    this.pos = {
      x0: nextProps.x0,
      y0: nextProps.y0,
      x1: nextProps.x1,
      y1: nextProps.y1
    }
  }

  componentDidMount() {
    // Append rendered DOM element to the container the
    // offsets were calculated for
    this.within.appendChild(this.el.current)
    if (this.props.followMouse) {
      this.within.addEventListener('mousemove', this.handleMouse)
    }
    window.addEventListener('resize', this.handleResize)
    window.addEventListener('scroll', this.handleResize, true)
  }

  componentWillUnmount() {
    this.within.removeChild(this.el.current)
    if (this.props.followMouse) {
      this.within.removeEventListener('mousemove', this.handleMouse)
    }
    window.removeEventListener('resize', this.handleResize)
    window.removeEventListener('scroll', this.handleResize)
  }

  handleMouse(evt) {
    this.dynX = evt.pageX - 1
    this.dynY = evt.pageY - 5
    this.recalculate()
  }

  handleResize() {
    this.pos = this.props.refreshPoints()
    this.recalculate()
  }

  recalculate() {
    const {x, y, angle, length} = this.calculate()

    if (!this.el.current) {
      console.log(this.el, 'Reference disappeared 3:')
      return
    }

    this.el.current.style.top = `${y}px`
    this.el.current.style.left = `${x}px`
    this.el.current.style.transform = `rotate(${angle}deg)`
    this.el.current.style.width = `${length}px`
    for (const elem of this.el.current.getElementsByTagName('div')) {
      elem.style.width = `${length}px`
    }
  }

  calculate() {
    const { x0, y0, x1, y1 } = this.pos
    const dy = (this.dynY || y1) - y0
    const dx = (this.dynX || x1) - x0
    const angle = Math.atan2(dy, dx) * 180 / Math.PI
    const length = Math.sqrt(dx * dx + dy * dy)
    return {x: x0, y: y0, angle, length}
  }

  render() {
    const {x, y, angle, length} = this.calculate()
    const within = this.props.within || ''

    this.within = within ? document.getElementById(within) : document.body

    const wrapperWidth = this.props.wrapperWidth || defaultWrapperWidth

    const commonStyle = {
      position: 'absolute',
      width: `${length}px`,
      zIndex: Number.isFinite(this.props.zIndex)
        ? String(this.props.zIndex)
        : '1'
    }

    const wrapperStyle = Object.assign({}, commonStyle, {
      top: `${y}px`,
      left: `${x}px`,
      height: `${wrapperWidth}px`,
      transform: `rotate(${angle}deg)`,
      // Rotate around (x0, y0)
      transformOrigin: '0 0'
    })

    const innerStyle = Object.assign({}, commonStyle, {
      top: `${Math.floor(wrapperWidth / 2)}px`,
      left: 0
    })

    const hoverAreaWidth = 11
    const hoverAreaOffset = 10

    const hoverAreaStyle = Object.assign({}, commonStyle, {
      position: 'relative',
      width: `${length - hoverAreaOffset * 2}px`,
      height: `${hoverAreaWidth}px`,
      color: 'transparent',
      transform: `translateX(${hoverAreaOffset}px) translateY(-${Math.floor(hoverAreaWidth / 2)}px)`
    })

    // We need a wrapper element to prevent an exception when then
    // React component is removed. This is because we manually
    // move the rendered DOM element after creation.
    return (
      <div className={this.props.classes.linetoPlaceholder}
        data-link-from={this.props.from}
        data-link-to={this.props.to} {...this.props.attributes}>
        <div className={`${this.props.classes.linetoWrapper} ${this.props.active && !this.props.followMouse ? 'linetoActive' : ''}`}
          ref={this.el} style={wrapperStyle}>
          {(this.props.active && !this.props.followMouse) &&
          <div style={hoverAreaStyle} className={this.props.classes.linetoHover} onContextMenu={evt => this.props.onContextMenu(evt, this)}/>}
          <div style={innerStyle}
            className={`${this.props.classes.linetoLine} ${this.props.active ? 'linetoActive' : ''}`}>
          </div>
        </div>
      </div>
    )
  }
}

const StyledLine = withStyles(lineStyles)(Line)
