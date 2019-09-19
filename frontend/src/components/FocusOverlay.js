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
    '&$fadeout': {
      opacity: 0,
      transition: 'opacity .5s ease-out'
    },
    '&$enableTransition': {
      transition: 'clip-path .5s linear'
    },
    '&$hidden': {
      display: 'none'
    },

    clipPath: 'polygon(' +
      '0                          0,' +
      '0                          100%,' +
      'var(--focus-overlay-x)     100%,' +
      'var(--focus-overlay-x)     var(--focus-overlay-y),' +
      'var(--focus-overlay-x-end) var(--focus-overlay-y),' +
      'var(--focus-overlay-x-end) var(--focus-overlay-y-end),' +
      'var(--focus-overlay-x)     var(--focus-overlay-y-end),' +
      'var(--focus-overlay-x)     100%,' +
      '100%                       100%,' +
      '100%                       0)',

    '&$multi$extend': {
      clipPath: 'polygon(' +
        '0                           0,' +
        '0                           100%,' +
        'var(--focus-overlay-x)      100%,' +
        'var(--focus-overlay-x)      var(--focus-overlay-y),' +
        'var(--focus-overlay2-x-end) var(--focus-overlay-y),' +
        'var(--focus-overlay2-x-end) var(--focus-overlay2-y-end),' +
        'var(--focus-overlay-x)      var(--focus-overlay2-y-end),' +
        'var(--focus-overlay-x)      100%,' +
        '100%                        100%,' +
        '100%                        0)'
    },

    '&$multi': {
      clipPath: 'polygon(' +
        '0                           0,' +
        '0                           100%,' +
        'var(--focus-overlay-x)      100%,' +
        'var(--focus-overlay-x)      var(--focus-overlay-y),' +
        'var(--focus-overlay-x-end)  var(--focus-overlay-y),' +
        'var(--focus-overlay-x-end)  var(--focus-overlay-y-end),' +
        'var(--focus-overlay-x)      var(--focus-overlay-y-end),' +
        'var(--focus-overlay-x)      100%,' +
        'var(--focus-overlay2-x)     100%,' +
        'var(--focus-overlay2-x)     var(--focus-overlay2-y),' +
        'var(--focus-overlay2-x-end) var(--focus-overlay2-y),' +
        'var(--focus-overlay2-x-end) var(--focus-overlay2-y-end),' +
        'var(--focus-overlay2-x)     var(--focus-overlay2-y-end),' +
        'var(--focus-overlay2-x)     100%,' +
        '100%                        100%,' +
        '100%                        0)'
    }
  },
  fadeout: {},
  enableTransition: {},
  hidden: {},
  extend: {},
  multi: {},

  box: {
    position: 'fixed',
    left: 'var(--focus-overlay-x)',
    top: 'var(--focus-overlay-y)',
    width: 'calc(var(--focus-overlay-x-end) - var(--focus-overlay-x))',
    height: 'calc(var(--focus-overlay-y-end) - var(--focus-overlay-y))'
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

const FocusOverlay = ({ contextRef }) => {
  const [state, setState] = useState({
    enableTransition: false,
    fadeout: null,
    element: null,
    element2: null,
    extend: false,
    padding: 5
  })
  const classes = useStyles()

  const overlay = useRef()

  useEffect(() => {
    const update = contextRef.current.update
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [state.element, contextRef])

  contextRef.current = {
    update() {
      if (!state.element || !overlay.current) {
        return
      }
      const rect = state.element.getBoundingClientRect()
      if (!rect) {
        return
      }
      const set = args => Object.entries(args).forEach(([key, value]) =>
        overlay.current.style.setProperty(`--${key}`, value))
      set({
        'focus-overlay-x': `${rect.left - state.padding}px`,
        'focus-overlay-y': `${rect.top - state.padding}px`,
        'focus-overlay-x-end': `${rect.right + state.padding}px`,
        'focus-overlay-y-end': `${rect.bottom + state.padding}px`
      })
      if (state.element2) {
        const rect2 = state.element2.getBoundingClientRect()
        set({
          'focus-overlay2-x': `${rect2.left - state.padding}px`,
          'focus-overlay2-y': `${rect2.top - state.padding}px`,
          'focus-overlay2-x-end': `${rect2.right + state.padding}px`,
          'focus-overlay2-y-end': `${rect2.bottom + state.padding}px`
        })
      }
    },
    open(elem, elem2, extend, padding = 5) {
      if (state.fadeout) {
        clearTimeout(state.fadeout)
      }
      const sp = elem.closest('.focusOverlayScrollParent')
      if (sp) {
        sp.scrollIntoView(false)
      }
      setState({
        enableTransition: state.element !== null,
        element: elem,
        element2: elem2,
        extend,
        fadeout: null,
        padding
      })
    },
    close() {
      if (state.fadeout) {
        return
      }
      setState({
        ...state,
        enableTransition: false,
        fadeout: setTimeout(() => {
          setState({
            enableTransition: false,
            fadeout: null,
            element: null,
            element2: null,
            extend: false,
            padding: 5
          })
        }, 500)
      })
    }
  }

  return (
    <div ref={overlay} className={`${classes.root} ${state.element ? '' : classes.hidden}
                                   ${state.element2 ? classes.multi : ''}
                                   ${state.extend ? classes.extend : ''}
                                   ${state.fadeout ? classes.fadeout : ''}
                                   ${state.enableTransition ? classes.enableTransition : ''}`}>
      <div ref={elem => contextRef.current.box = elem} className={classes.box} />
    </div>
  )
}

const FocusOverlayProvider = ({ children }) => {
  const focusOverlayContextValue = useRef({
    box: null
  })

  const focusOverlayContextProxy = {
    update: (...args) => focusOverlayContextValue.current.update(...args),
    open: (...args) => focusOverlayContextValue.current.open(...args),
    close: (...args) => focusOverlayContextValue.current.close(...args),
    get box() { return focusOverlayContextValue.current.box }
  }

  return <>
    <FocusOverlayContext.Provider value={focusOverlayContextProxy}>
      {children}
    </FocusOverlayContext.Provider>
    <FocusOverlay contextRef={focusOverlayContextValue} />
  </>
}

export const useFocusOverlay = () => useContext(FocusOverlayContext)

export default FocusOverlayProvider
