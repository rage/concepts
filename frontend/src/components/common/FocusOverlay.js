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

  box: {
    position: 'fixed',
    display: 'none'
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

  const overlay = useRef()
  const box = useRef()
  const update = () => {
    if (!state.element || !overlay.current) {
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
    box.current.style.top = top
    box.current.style.left = left
    box.current.style.bottom = bottom
    box.current.style.right = right
    overlay.current.style.clipPath =
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

  const close = () => {
    if (state.fadeout) {
      return
    }
    setState({
      element: state.element,
      fadeout: setTimeout(() => {
        setState({
          fadeout: null,
          element: null
        })
      }, 5000)
    })
  }

  return <>
    <FocusOverlayContext.Provider value={{box, open, close}}>
      {children}
    </FocusOverlayContext.Provider>
    <div ref={overlay} className={`${classes.root} ${state.element ? '' : 'hidden'}
                                   ${state.fadeout ? 'fadeout' : ''}`}>
      <div ref={box} className={classes.box}/>
    </div>
  </>
}

export const useFocusOverlay = () => useContext(FocusOverlayContext)

export default FocusOverlay
