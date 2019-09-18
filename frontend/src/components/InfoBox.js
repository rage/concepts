import React, { useRef, useState, createContext, useContext } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Paper, Typography, IconButton, Popper, DialogActions, Dialog, DialogContent, Button
} from '@material-ui/core'
import {
  InfoOutlined as InfoIcon, NavigateNext as NextIcon, NavigateBefore as PrevIcon,
  Close as CloseIcon, OndemandVideo as VideoIcon
} from '@material-ui/icons'

import { useFocusOverlay } from './FocusOverlay'
import userGuide from '../static/userGuide'

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

  return <>
    <InfoBoxContext.Provider value={infoBoxContextValue}>
      {children}
    </InfoBoxContext.Provider>
    <InfoBox contextRef={infoBoxContextValue} />
  </>
}

Object.values(userGuide.views)
  .forEach(view => view
    .forEach((step, index) =>
      step.index = index))

userGuide.viewMaps = Object.fromEntries(
  Object.entries(userGuide.views).map(([view, parts]) => [
    view, Object.fromEntries(parts.map(item => [item.id, item]))
  ])
)

const InfoBox = ({ contextRef }) => {
  const [currentView, setCurrentView] = useState(null)
  const [currentVideo, setCurrentVideo] = useState({ open: false })
  const currentStep = useRef(0)
  const [state, setState] = useState({
    open: false
  })
  const classes = useStyles()
  const overlay = useFocusOverlay()

  const [redrawIndex, setRedrawIndex] = useState(0)
  const redraw = () => setRedrawIndex(redrawIndex + 1)

  const closeVideo = () => {
    setCurrentVideo({ ...currentVideo, open: false })
    setTimeout(() => setCurrentVideo({ open: false }), 500)
  }

  const local = {
    isValidStep(stepIndex) {
      if (!currentView || userGuide.views[currentView].length <= stepIndex) {
        return false
      }
      const step = userGuide.views[currentView][stepIndex]
      return step && step.ref && step.ref.current && step.ref.current.offsetParent
    },
    get hasNext() {
      return currentView && userGuide.views[currentView].length > state.index + 1
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
      contextRef.current.show(userGuide.views[currentView][state.index + 1])
    },
    showPrev() {
      if (!state.open || !local.canMovePrev) {
        return
      }
      contextRef.current.show(userGuide.views[currentView][state.index - 1])
    }
  }

  contextRef.current = {
    show(info) {
      if (state.fadeout) {
        clearTimeout(state.fadeout)
      }
      const newState = {
        ...info,
        ...userGuide.defaults,
        enableTransition: open,
        open: true
      }
      overlay.open(newState.ref.current, newState.padding)
      currentStep.current = newState.index
      setState(newState)
    },
    get canOpen() {
      return Boolean(currentView)
    },
    open() {
      if (!local.isValidStep(currentStep.current)) {
        currentStep.current = 0
      }
      contextRef.current.show(userGuide.views[currentView][currentStep.current])
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
      if (!step.ref) {
        step.ref = React.createRef()
      }
      return elem => {
        step.ref.current = elem
        redraw()
      }
    },
    redrawIfOpen(view, id) {
      if (currentView === view && state.id === id) {
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
      open={open}
      anchorEl={open && overlay.box && overlay.box.current ? overlay.box.current : undefined}
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
