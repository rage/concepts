// import PropTypes from "prop-types"
import React, {Component, PureComponent} from "react"

const defaultAnchor = {x: 0.5, y: 0.5}
const defaultInnerColor = "#f00"
const defaultInnerStyle = "solid"
const defaultInnerWidth = 1
const defaultWrapperWidth = 11

// const optionalStyleProps = {
// 	borderColor: PropTypes.string,
// 	borderStyle: PropTypes.string,
// 	borderWidth: PropTypes.number,
// 	className: PropTypes.string,
// 	zIndex: PropTypes.number,
// }

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
    //const from = document.getElementById(fromId)
    //const to = document.getElementById(toId)

    if (!fromBox || !toBox) {
      return false
    }

    const anchor0 = this.fromAnchor
    const anchor1 = this.toAnchor

    //const fromBox = from.getBoundingClientRect()
    //const toBox = to.getBoundingClientRect()

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

    const x0 = fromBox.x + fromBox.width * anchor0.x + offsetX + 4
    const x1 = toBox.x + toBox.width * anchor1.x + offsetX + 4
    const y0 = fromBox.y + fromBox.height * anchor0.y + offsetY - 4
    const y1 = toBox.y + toBox.height * anchor1.y + offsetY - 4

    return {x0, y0, x1, y1}
  }

  render() {
    const points = this.detect()
    return points ? (
      <Line {...points} {...this.props}/>
    ) : null
  }
}

// LineTo.propTypes = Object.assign({}, {
// 	from: PropTypes.object.isRequired,
// 	to: PropTypes.object.isRequired,
// 	within: PropTypes.string,
// 	fromAnchor: PropTypes.string,
// 	toAnchor: PropTypes.string,
// 	delay: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
// }, optionalStyleProps)

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
      height: `${this.props.wrapperWidth || defaultWrapperWidth}px`,
      color: "transparent",
      transform: `rotate(${angle}deg)`,
      // Rotate around (x0, y0)
      transformOrigin: "0 0",
    })

    const innerStyle = Object.assign({}, commonStyle, {
      position: "absolute",
      top: `${Math.floor((this.props.wrapperWidth || defaultWrapperWidth) / 2)}px`,
      left: 0,
      borderTopColor: this.props.innerColor || defaultInnerColor,
      borderTopStyle: this.props.innerStyle || defaultInnerStyle,
      borderTopWidth: this.props.innerWidth || defaultInnerWidth,
    })

    // We need a wrapper element to prevent an exception when then
    // React component is removed. This is because we manually
    // move the rendered DOM element after creation.
    return (
      <div className={this.props.placeholderClassName || "react-lineto-placeholder"}
           data-link-from={this.props.from}
           data-link-to={this.props.to} {...this.props.attributes}>
        <div className={this.props.wrapperClassName || "react-lineto-wrapper"} ref={this.el}
             style={wrapperStyle}>
          <div style={innerStyle} className={this.props.className || "react-lineto-line"}/>
        </div>
      </div>
    )
  }
}

// Line.propTypes = Object.assign({}, {
// 	x0: PropTypes.number.isRequired,
// 	y0: PropTypes.number.isRequired,
// 	x1: PropTypes.number.isRequired,
// 	y1: PropTypes.number.isRequired,
// }, optionalStyleProps)
