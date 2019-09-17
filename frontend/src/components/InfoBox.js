import React, { useRef, useState, createContext, useContext } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Paper, Typography, IconButton, Popper, Button } from '@material-ui/core'
import {
  InfoOutlined as InfoIcon, NavigateNext as NextIcon, NavigateBefore as PrevIcon, Close as CloseIcon
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
  const [state, setState] = useState({
    open: false
  })
  const classes = useStyles()
  const overlay = useFocusOverlay()

  const local = {
    get hasNext() {
      return currentView && userGuide.views[currentView].length > state.index + 1
        && Boolean(userGuide.views[currentView][state.index + 1].ref)
    },
    get hasPrev() {
      return state.index > 0
    },
    showNext() {
      if (!state.open || !local.hasNext) {
        return
      }
      contextRef.current.show(userGuide.views[currentView][state.index + 1])
    },
    showPrev() {
      if (!state.open || !local.hasPrev) {
        return
      }
      contextRef.current.show(userGuide.views[currentView][state.index - 1])
    }
  }

  contextRef.current = {
    view: currentView,
    show(info) {
      if (state.fadeout) {
        clearTimeout(state.fadeout)
      }
      overlay.open(info.ref.current)
      setState({
        enableTransition: open,
        open: true,
        ...userGuide.defaults,
        ...info
      })
    },
    get canOpen() {
      return Boolean(contextRef.current.view)
    },
    open() {
      contextRef.current.show(userGuide.views[contextRef.current.view][0])
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
      if (contextRef.current.view !== view) {
        contextRef.current.close()
        contextRef.current.view = view
        setCurrentView(view)
      }
    },
    unsetView(view) {
      if (contextRef.current.view === view) {
        contextRef.current.setView(null)
      }
    },
    ref(view, id) {
      const step = userGuide.viewMaps[view][id]
      if (!step.ref) {
        step.ref = React.createRef()
      }
      return step.ref
    }
  }

  const { title, description, open, offset, placement, fadeout, enableTransition } = state
  const POPPER_MODIFIERS = {
    offset: {
      offset: offset ? `${offset.alignment}, ${offset.separation}` : '0px, 0px'
    }
  }

  return (
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
          <Button size='small' className={classes.button} onClick={() => alert('Not implemented')}>
            Show video
          </Button>
          <div className={classes.navigation}>
            <IconButton
              className={classes.button} onClick={local.showPrev} disabled={!local.hasPrev}
            >
              <PrevIcon />
            </IconButton>
            <IconButton
              className={classes.button} onClick={local.showNext} disabled={!local.hasNext}
            >
              <NextIcon />
            </IconButton>
          </div>
        </div>
      </Paper>
    </Popper>
  )
}

export const useInfoBox = () => useContext(InfoBoxContext)

export default InfoBoxProvider
