import React, { useRef } from 'react'
import { Slider } from '@material-ui/core'

const HackySlider = ({ value, hackyRef, ...args }) => {
  const ref = useRef()
  hackyRef.current = {
    setValue(val) {
      const styleVal = `${val / 2}%`
      for (const child of ref.current.children) {
        if (child.classList.contains('MuiSlider-track')) {
          child.style.height = styleVal
        } else if (child.classList.contains('MuiSlider-thumb')) {
          child.style.bottom = styleVal
        } else if (child.nodeName === 'INPUT') {
          child.value = val
        }
      }
    }
  }
  return <Slider value={value} ref={ref} {...args} />
}

export default HackySlider
