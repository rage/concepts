import React, {Component, PureComponent} from "react"

import { withStyles } from '@material-ui/core/styles'

const defaultAnchor = {x: 0.5, y: 0.5}
const defaultInnerColor = "#f00"
const defaultInnerStyle = "solid"
const defaultInnerWidth = 1
const defaultWrapperWidth = 11

export default class LineTo extends Component {
  componentWillMount() {
    this.fromAnchor = this.parseAnchor(this.props.fromAnchor)
    this.toAnchor = this.parseAnchor(this.props.toAnchor)
    this.delay = this.parseDelay(this.props.delay)
    this.positionChanged = true
  }

  componentDidMount() {
    this.delay = this.parseDelay(this.props.delay)
    if (typeof this.delay !== "undefined") {
      this.deferUpdate(this.delay)
    }
  }

  static nodeEquals(otherNode) {
    return otherNode.x === this.x && otherNode.y === this.y
      && otherNode.width === this.width && otherNode.height === this.height
  }

  static copyNode(node) {
    if (!node) {
      return {
        equals: () => false,
      }
    }
    return {
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height,
      equals: LineTo.nodeEquals,
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
    if (typeof this.delay !== "undefined") {
      this.deferUpdate(this.delay)
    }
  }

  shouldComponentUpdate() {
    if (this.props.redrawLines) {
      return true
    }
    if (this.positionChanged) {
      this.positionChanged = false
      return true
    }
    return false
  }

  componentWillUnmount() {
    if (this.t) {
      clearTimeout(this.t)
      this.t = null
    }
  }

  // Forced update after delay (MS)
  deferUpdate(delay) {
    if (this.t) {
      clearTimeout(this.t)
    }
    this.t = setTimeout(() => this.forceUpdate(), delay)
  }

  parseDelay(value) {
    if (typeof value === "undefined") {
      return value
    } else if (typeof value === "boolean" && value) {
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
      case "top":
        return {y: 0}
      case "left":
        return {x: 0}
      case "middle":
        return {y: 0.5}
      case "center":
        return {x: 0.5}
      case "bottom":
        return {y: 1}
      case "right":
        return {x: 1}
      default:
        return {}
    }
  }

  parseAnchor(value) {
    if (!value) {
      return defaultAnchor
    }
    if (typeof value === "object") {
      return value
    }
    const parts = value.split(" ")
    if (parts.length > 2) {
      throw new Error("LinkTo anchor format is \"<x> <y>\"")
    }
    const [x, y] = parts
    return Object.assign({}, defaultAnchor, this.parseAnchorText(x), this.parseAnchorText(y))
  }

  detect() {
    const {within = "", from: fromBox, to: toBox} = this.props

    if (!fromBox || !toBox) {
      return false
    }

    const anchor0 = this.fromAnchor
    const anchor1 = this.toAnchor

    let offsetX = window.pageXOffset
    let offsetY = window.pageYOffset

    if (within) {
      const p = document.getElementsByClassName(within)[0]
      if (!p) {
        return false
      }
      const boxp = p.getBoundingClientRect()

      offsetX += boxp.left
      offsetY += boxp.top
    }

    const x0 = fromBox.x + fromBox.width * anchor0.x + offsetX
    const x1 = toBox.x + toBox.width * anchor1.x + offsetX
    const y0 = fromBox.y + fromBox.height * anchor0.y + offsetY
    const y1 = toBox.y + toBox.height * anchor1.y + offsetY

    return {x0: x0 - 1, y0, x1: x1 + 2, y1}
  }

  render() {
    const points = this.detect()
    return points ? (
      <StyledLine {...points} {...this.props}/>
    ) : null
  }
}

const lineStyles = theme => ({
	linetoHover: {
	  "&:hover": {
	    backgroundColor: "rgba(255, 0, 0, 0.25)",
    },
  },
  linetoLine: {
    borderTop: "1px solid red",
  }
})

export class Line extends PureComponent {
  constructor(props) {
    super(props)
    this.el = React.createRef()
  }

  componentDidMount() {
    // Append rendered DOM element to the container the
    // offsets were calculated for
    this.within.appendChild(this.el.current)
  }

  componentWillUnmount() {
    this.within.removeChild(this.el.current)
  }

  render() {
    const {x0, y0, x1, y1, within = ""} = this.props

    this.within = within ? document.getElementsByClassName(within)[0] : document.body

    const dy = y1 - y0
    const dx = x1 - x0

    const angle = Math.atan2(dy, dx) * 180 / Math.PI
    const length = Math.sqrt(dx * dx + dy * dy)
    const wrapperWidth = this.props.wrapperWidth || defaultWrapperWidth

    const commonStyle = {
      position: "absolute",
      width: `${length}px`,
      zIndex: Number.isFinite(this.props.zIndex)
        ? String(this.props.zIndex)
        : "1",
    }

    const wrapperStyle = Object.assign({}, commonStyle, {
      position: "absolute",
      top: `${y0}px`,
      left: `${x0}px`,
      height: `${wrapperWidth}px`,
      transform: `rotate(${angle}deg)`,
      // Rotate around (x0, y0)
      transformOrigin: "0 0",
    })

    const innerStyle = Object.assign({}, commonStyle, {
      position: "absolute",
      top: `${Math.floor(wrapperWidth / 2)}px`,
      left: 0,
      borderTopColor: this.props.innerColor || defaultInnerColor,
      borderTopStyle: this.props.innerStyle || defaultInnerStyle,
      borderTopWidth: this.props.innerWidth || defaultInnerWidth,
    })

		const hoverAreaWidth = 11;
    const hoverAreaOffset = 10;

		const hoverAreaStyle = Object.assign({}, commonStyle, {
			position: "relative",
			width: `${length - hoverAreaOffset*2}px`,
			height: `${hoverAreaWidth}px`,
			color: "transparent",
			transform: `translateX(${hoverAreaOffset}px) translateY(-${Math.floor(hoverAreaWidth/2)}px)`,
		})

    // We need a wrapper element to prevent an exception when then
    // React component is removed. This is because we manually
    // move the rendered DOM element after creation.
    return (
      <div className={this.props.classes.linetoPlaceholder}
           data-link-from={this.props.from}
           data-link-to={this.props.to} {...this.props.attributes}>
        <div className={this.props.classes.linetoWrapper} ref={this.el} style={wrapperStyle}>
          {this.props.selectable && <div style={hoverAreaStyle} className={this.props.classes.linetoHover}/>}
					<div style={innerStyle} className={this.props.classes.linetoLine}>
					</div>
        </div>
      </div>
    )
  }
}

const StyledLine = withStyles(lineStyles)(Line)
