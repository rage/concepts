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
    '&.enableTransition': {
      transition: 'clip-path .5s linear'
    },
    '&.hidden': {
      display: 'none'
    }
  },

  box: {
    position: 'fixed'
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

const FocusOverlay = ({ children, padding = 5 }) => {
  const [state, setState] = useState({
    enableTransition: false,
    fadeout: null,
    element: null
  })
  const classes = useStyles()

  const overlay = useRef()
  const box = useRef()
  const update = () => {
    if (!state.element || !overlay.current || !box.current) {
      return
    }
    const rect = state.element.getBoundingClientRect()
    if (!rect) {
      return
    }
    const y = rect.top - padding,
      x = rect.left - padding,
      yEnd = rect.bottom + padding,
      xEnd = rect.right + padding
    box.current.style.top = `${y}px`
    box.current.style.left = `${x}px`
    box.current.style.height = `${yEnd - y}px`
    box.current.style.width = `${xEnd - x}px`
    overlay.current.style.clipPath =
      `polygon(0 0, 0 100%,  ${x}px 100%,  ${x}px ${y}px,  ${xEnd}px ${y}px,
               ${xEnd}px ${yEnd}px,  ${x}px ${yEnd}px, ${x}px 100%,  100% 100%, 100% 0)`
  }

  useEffect(() => {
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.element])

  const open = elem => {
    if (state.fadeout) {
      clearTimeout(state.fadeout)
    }
    setState({
      enableTransition: state.element !== null,
      element: elem,
      fadeout: null
    })
  }

  const close = () => {
    if (state.fadeout) {
      return
    }
    setState({
      enableTransition: false,
      element: state.element,
      fadeout: setTimeout(() => {
        setState({
          enableTransition: false,
          fadeout: null,
          element: null
        })
      }, 500)
    })
  }

  return <>
    <FocusOverlayContext.Provider value={{ box, open, close, update }}>
      {children}
    </FocusOverlayContext.Provider>
    <div ref={overlay} className={`${classes.root} ${state.element ? '' : 'hidden'}
                                   ${state.fadeout ? 'fadeout' : ''}
                                   ${state.enableTransition ? 'enableTransition' : ''}`}>
      <div ref={box} className={classes.box} />
    </div>
  </>
}

export const useFocusOverlay = () => useContext(FocusOverlayContext)

export default FocusOverlay
