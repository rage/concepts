import React, { useState } from 'react'

const ToggleButton = ({ text }) => {
  const [selected, setSelected] = useState(false)

  const toggle = () => {
    setSelected(!selected)
  }

  const handleClick = () => {
    toggle()
  }

  const buttonStyle = () => {
    return {
      backgroundColor: selected ? '#9ecae1' : '#ffffff'
    }
  }

  return (
    <button
      onClick={handleClick}
      className="curri-button"
      style={buttonStyle()}>
      {text}
    </button>
  )
}


export default ToggleButton