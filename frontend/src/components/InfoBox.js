import React, { useRef, useState, useCallback, createContext, useContext } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Paper, Typography, IconButton, Popper, DialogActions, Dialog, DialogContent, Button
} from '@material-ui/core'
import {
  InfoOutlined as InfoIcon, NavigateNext as NextIcon, NavigateBefore as PrevIcon,
  Close as CloseIcon, OndemandVideo as VideoIcon
} from '@material-ui/icons'

import { Role } from '../lib/permissions'
import { useFocusOverlay } from './FocusOverlay'
import userGuide from '../static/userGuide'
import { useLoginStateValue } from '../lib/store'
import { useAlert } from '../dialogs/alert'

const useStyles = makeStyles(theme => ({
  root: {
    zIndex: '200',
    width: '400px',
    display: 'flex',
    flexDirection: 'column',
    padding: '16px 16px 8px 16px',
    boxSizing: 'border-box',
    backgroundColor: theme.palette.primary.main
  },
  popper: {
    zIndex: '200',
    '&$enableTransition': {
      transition: 'transform .5s linear'
    },
    animation: '$fadein .5s',
    '&$fadeout': {
      opacity: 0,
      transition: 'opacity .5s ease-out'
    }
  },
  enableTransition: {},
  fadeout: {},
  '@keyframes fadein': {
    from: {
      opacity: 0
    },
    to: {
      opacity: 1
    }
  },
  infoHeader: {
    display: 'flex',
    alignItems: 'flex-end',
    margin: '-8px -8px 4px -8px'
  },
  infoIcon: {
    color: 'white',
    padding: '12px',
    margin: 0,
    display: 'inline-flex'
  },
  title: {
    flex: '1',
    paddingBottom: '0px',
    maxWidth: '100%',
    overflowWrap: 'break-word',
    hyphens: 'auto',
    marginBottom: '8px',
    color: 'white'
  },
  body: {
    color: 'white'
  },
  infoFooter: {
    alignSelf: 'flex-end',
    width: '100%',
    flex: '0 0 auto',
    display: 'flex',
    justifyContent: 'space-between'
  },
  button: {
    color: 'white',
    borderColor: 'white'
  },
  invisible: {
    visibility: 'hidden'
  }
}))

const InfoBoxContext = createContext(null)

const InfoBoxProvider = ({ children }) => {
  const infoBoxContextValue = useRef({})

  const infoBoxContextProxy = {
    setView: (...args) => infoBoxContextValue.current.setView(...args),
    unsetView: (...args) => infoBoxContextValue.current.unsetView(...args),
    ref: (...args) => infoBoxContextValue.current.ref(...args),
    secondaryRef: (...args) => infoBoxContextValue.current.secondaryRef(...args),
    redrawIfOpen: (...args) => infoBoxContextValue.current.redrawIfOpen(...args),
    open: (...args) => infoBoxContextValue.current.open(...args)
  }

  return <>
    <InfoBox contextRef={infoBoxContextValue} />
    <InfoBoxContext.Provider value={infoBoxContextProxy}>
      {children}
    </InfoBoxContext.Provider>
  </>
}

for (const view of Object.values(userGuide.views)) {
  for (const step of view) {
    step.minimumRole = Role.fromString(step.minimumRole)
  }
}

const mapObject = (obj, func) => Object.fromEntries(Object.entries(obj)
  .map(([k, v], ...args) => [k, func(v, ...args)]))

userGuide.originalViews = userGuide.views
userGuide.viewMaps = mapObject(userGuide.views,
  view => Object.fromEntries(view.map(item => [item.id, item])))

let userGuideFilter = undefined

const filterUserGuide = role => {
  if (userGuideFilter === role) {
    return
  }

  userGuide.views = mapObject(userGuide.originalViews,
    view => view.filter(step => step.minimumRole <= role))

  for (const view of Object.values(userGuide.views)) {
    let index = 0
    for (const step of view) {
      step.index = index++
    }
  }

  userGuideFilter = role
}

const InfoBox = ({ contextRef }) => {
  const [currentView, setCurrentView] = useState(null)
  const [currentVideo, setCurrentVideo] = useState({ open: false })
  const currentStep = useRef(0)
  const [state, setState] = useState({
    open: false
  })
  const classes = useStyles()
  const alert = useAlert()
  const overlay = useFocusOverlay()
  const [{ user }] = useLoginStateValue()
  filterUserGuide(user?.role || Role.VISITOR)
  const currentUserGuide = currentView ? userGuide.views[currentView] : null

  const [, updateState] = useState()
  const redraw = useCallback(() => updateState({}), [])

  const closeVideo = () => {
    setCurrentVideo({ ...currentVideo, open: false })
    setTimeout(() => setCurrentVideo({ open: false }), 500)
  }

  const local = {
    isValidStep(stepIndex) {
      return Boolean(currentUserGuide?.[stepIndex]?.ref?.offsetParent)
    },
    get hasNext() {
      return currentUserGuide?.length > state.index + 1
    },
    get hasPrev() {
      return state.index > 0
    },
    get canMoveNext() {
      return local.isValidStep(state.index + 1)
    },
    get canMovePrev() {
      return this.hasPrev && local.isValidStep(state.index - 1)
    },
    showNext() {
      if (!state.open || !local.canMoveNext) {
        return
      }
      contextRef.current.show(currentUserGuide[state.index + 1])
    },
    showPrev() {
      if (!state.open || !local.canMovePrev) {
        return
      }
      contextRef.current.show(currentUserGuide[state.index - 1])
    }
  }

  contextRef.current = {
    show(info) {
      if (state.fadeout) {
        clearTimeout(state.fadeout)
      }
      const newState = {
        ...userGuide.defaults,
        ...info,
        enableTransition: open,
        open: true
      }
      overlay.open(
        newState.ref,
        newState.secondaryRef || null,
        newState.secondaryRefExtend,
        newState.padding)
      currentStep.current = newState.index
      setState(newState)
    },
    open() {
      if (!currentUserGuide) {
        alert({ title: 'User guide not available in this view' })
        return
      }
      if (!local.isValidStep(currentStep.current)) {
        const start = currentStep.current
        for (let step = start - 1; step >= 0; step--) {
          if (local.isValidStep(step)) {
            currentStep.current = step
            break
          }
        }
        if (currentStep.current === start) {
          for (let step = start + 1; step <= currentUserGuide.length; step++) {
            if (local.isValidStep(step)) {
              currentStep.current = step
              break
            }
          }
        }
        if (currentStep.current === start) {
          alert({ title: 'User guide not available in this view' })
          return
        }
      }
      contextRef.current.show(currentUserGuide[currentStep.current])
    },
    close() {
      if (state.fadeout || !state.open) {
        return
      }
      setState({
        ...state,
        fadeout: setTimeout(() => setState({
          open: false
        }), 500)
      })
      overlay.close()
    },
    setView(view) {
      if (currentView !== view) {
        contextRef.current.close()
        currentStep.current = 0
        setCurrentView(view)
      }
    },
    unsetView(view) {
      if (currentView === view) {
        contextRef.current.setView(null)
      }
    },
    ref(view, id) {
      const step = userGuide.viewMaps[view][id]
      if (!step) {
        throw new Error(`Unknown step ${view}/${id}`)
      }
      if (!step.refFunc) {
        step.refFunc = elem => {
          if (!(elem instanceof HTMLElement) && (elem?.node instanceof HTMLElement)) {
            elem = elem.node
          }
          step.ref = elem
          redraw()
        }
      }
      return step.refFunc
    },
    secondaryRef(view, id, extend = false) {
      const step = userGuide.viewMaps[view][id]
      step.secondaryRefExtend = extend
      if (!step.secondaryRefFunc) {
        step.secondaryRefFunc = elem => {
          const changed = elem !== step.secondaryRef
          step.secondaryRef = elem
          redraw()
          if (changed && currentView === view && state.id === id) {
            overlay.update(step.secondaryRef, step.secondaryRefExtend)
          }
        }
      }
      return step.secondaryRefFunc
    },
    redrawIfOpen(view, ...ids) {
      if (currentView === view && ids.includes(state.id)) {
        redraw()
        overlay.update()
      }
    }
  }

  const {
    title, description, video, open, alignment, separation, placement, fadeout, enableTransition
  } = state
  const POPPER_MODIFIERS = { offset: { offset: `${alignment}, ${separation}` } }

  return <>
    <Popper
      open={Boolean(open && overlay.box)}
      // This makes a warning that says "Failed prop type: Material-UI: the `anchorEl` prop provided
      // to the component is invalid.". The warning happens because the overlay box doesn't exist in
      // the DOM yet when this is rendered.
      // It could be bypassed by adding a setTimeout(..., 0) after opening the overlay box, but that
      // causes other fun bugs, such as the info box jumping around when moving.
      anchorEl={open && overlay.box ? overlay.box : undefined}
      placement={placement}
      modifiers={POPPER_MODIFIERS}
      className={`${classes.popper} ${enableTransition ? classes.enableTransition : ''}
                  ${fadeout ? classes.fadeout : ''}`}
    >
      <Paper elevation={0} className={classes.root}>
        <div className={classes.infoHeader}>
          <div className={classes.infoIcon}>
            <InfoIcon />
          </div>
          <Typography className={classes.title} variant='h6'>
            {title}
          </Typography>
          <IconButton className={classes.button} onClick={contextRef.current.close}>
            <CloseIcon />
          </IconButton>
        </div>
        <Typography className={classes.body} variant='body1'>
          {description}
        </Typography>
        <div className={classes.infoFooter}>
          <IconButton
            className={`${classes.button} ${!video ? classes.invisible : ''}`}
            onClick={() => setCurrentVideo({ open: true, source: video })}
          >
            <VideoIcon />
          </IconButton>
          <div className={classes.navigation}>
            <IconButton
              className={`${classes.button} ${!local.hasPrev ? classes.invisible : ''}`}
              onClick={local.showPrev} disabled={!local.canMovePrev}
            >
              <PrevIcon />
            </IconButton>
            <IconButton
              className={`${classes.button} ${!local.hasNext ? classes.invisible : ''}`}
              onClick={local.showNext} disabled={!local.canMoveNext}
            >
              <NextIcon />
            </IconButton>
          </div>
        </div>
      </Paper>
    </Popper>
    <Dialog maxWidth='xl' open={Boolean(currentVideo.open)} onClose={closeVideo}>
      <DialogContent>
        {currentVideo.source && <video controls autoPlay muted width='100%' height='100%'>
          <source src={currentVideo.source} type='video/webm' />
        </video>}
      </DialogContent>
      <DialogActions>
        <Button onClick={closeVideo} color='primary' variant='outlined'>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  </>
}

export const useInfoBox = () => useContext(InfoBoxContext)

export default InfoBoxProvider
