import React, { useContext, useState, createContext, useRef, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  root: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 100,
    animation: '$fadein .5s',
    '&.fadeout': {
      opacity: 0,
      transition: 'opacity .5s ease-out'
    },
    '&.hidden': {
      display: 'none'
    }
  },

  '@keyframes fadein': {
    from: {
      opacity: 0
    },
    to: {
      opacity: 1
    }
  }
}))

const FocusOverlayContext = createContext(null)

const FocusOverlay = ({children, padding = 5}) => {
  const [state, setState] = useState({
    fadeout: null,
    element: null
  })
  const classes = useStyles()

  const ref = useRef()
  const update = () => {
    if (!state.element || !ref.current) {
      return
    }
    const rect = state.element.getBoundingClientRect()
    if (!rect) {
      return
    }
    const top = rect.top - padding,
      left = rect.left - padding,
      bottom = rect.bottom + padding,
      right = rect.right + padding
    ref.current.style.clipPath =
      `polygon(0 0, 0 100%,  ${left}px 100%,  ${left}px ${top}px,  ${right}px ${top}px,
               ${right}px ${bottom}px,  ${left}px ${bottom}px, ${left}px 100%,  100% 100%, 100% 0)`
  }

  useEffect(() => {
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [state.element])

  const open = elem => {
    if (state.fadeout) {
      clearTimeout(state.fadeout)
    }
    setState({
      element: elem,
      fadeout: null
    })
  }

  console.log(state.fadeout)
  console.log(state.element)
  const close = () => {
    if (state.fadeout) {
      return
    }
    console.log("close", state.fadeout)
    console.log("close", state.element)
    setState({
      element: state.element,
      fadeout: setTimeout(() => {
        console.log("closed", state.element)
        console.log("closed", state.fadeout)
        setState({
          fadeout: null,
          element: null
        })
      }, 5000)
    })
    console.log("close 2", state.element)
    console.log("close 2", state.fadeout)
  }

  return <>
    <FocusOverlayContext.Provider value={{element: state.element, open, close}}>
      {children}
    </FocusOverlayContext.Provider>
    <div ref={ref} className={`${classes.root} ${state.element ? '' : 'hidden'}
                               ${state.fadeout ? 'fadeout' : ''}`}/>
  </>
}

export const useFocusOverlay = () => useContext(FocusOverlayContext)

export default FocusOverlay
