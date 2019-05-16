import React from 'react'

const HeaderButton = ({ text, onClick }) => (
  <button
    className="curri-button"
    style={{ backgroundColor: '#e8e8e8' }}
    onClick={onClick}
  >
    {text}
  </button>
)

export default HeaderButton