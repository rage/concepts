import React from 'react'
import './App.css'

const ToggleButton = (props) => {
  state = {
    toggleSetting: 1
  }

  increment = (i) => {
    return i === 3 ? 1 : i + 1
  }


  handleClick = () => {
    this.props.updateTopicValue(this.props.course, this.props.topic.name, this.increment(this.props.topic.value))
    this.setState(({ toggleSetting }) => ({
      toggleSetting: this.increment(toggleSetting)
    }))
  }

  buttonStyle = (toggleValue) => {
    switch (toggleValue) {
    case 1:
      return { backgroundColor: '#ffffff' }
    case 2:
      return { backgroundColor: '#9ecae1' }
    case 3:
      return { backgroundColor: '#3182bd' }
    default:
      return { backgroundColor: '#ffffff' }
    }
  }
  return (
    <button
      onClick={this.handleClick}
      className="curri-button"
      style={this.buttonStyle(this.props.topic.value)}>
      {this.props.text}
    </button>
  )
}


export default ToggleButton