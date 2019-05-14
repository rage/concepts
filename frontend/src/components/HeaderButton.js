import React, { Component } from 'react'
import './App.css'

const HeaderButton extends Component {
  render() {
    return (
      <button
        className="curri-button"
        style={{ backgroundColor: '#e8e8e8' }}>
        {this.props.text}
      </button>
    )
  }
}

export default HeaderButton