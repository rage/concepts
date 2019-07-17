import React, { useState, createContext, useContext } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Button, Paper, Typography, IconButton, Popper } from '@material-ui/core'
import { InfoOutlined as InfoIcon } from '@material-ui/icons'
import { useFocusOverlay } from './FocusOverlay'
import userGuide from '../../static/userGuide'
import { getProgress, setProgress } from '../../lib/userProgress'
import { useLoginStateValue } from '../../store'

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
    '&.enableTransition': {
      transition: 'transform .5s linear'
    },
    animation: '$fadein .5s',
    '&.fadeout': {
      opacity: 0,
      transition: 'opacity .5s ease-out'
    }
  },
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
    alignItems: 'center'
  },
  infoHeaderIcon: {
    flex: '1 1 auto',
    marginTop: '-8px',
    marginLeft: '-13px',
    marginRight: '-4px',
    alignSelf: 'flex-start'
  },
  headerTitleContainer: {
    flex: '1 1 auto'
  },
  title: {
    paddingBottom: '0px',
    maxWidth: '100%',
    overflowWrap: 'break-word',
    hyphens: 'auto',
    marginBottom: '8px',
    color: 'white'
  },
  icon: {
    color: 'white'
  },
  body: {
    color: 'white'
  },
  button: {
    color: 'white',
    width: '50px',
    borderColor: 'white',
    flex: '0 0 auto',
    alignSelf: 'flex-end'
  }
}))

const InfoBoxContext = createContext(null)

const InfoBox = ({ children }) => {
  const [state, setState] = useState({
    open: false
  })
  const classes = useStyles()
  const overlay = useFocusOverlay()
  const [{ user }, dispatch] = useLoginStateValue()

  const {
    title,
    description,
    open,
    offset,
    placement,
    fadeout,
    enableTransition
  } = state

  const openPopper = async (target, newPlacement, id, alignment = 0, separation = 0) => {
    console.log('user: ', user)
    if (user) {
      const info = userGuide[id]
      const index = await getProgress(user.id)
      console.log('popper', info.index, index)
      if (index >= info.index) {
        console.log('Guide too high')
        return
      }
      if (fadeout) {
        clearTimeout(fadeout)
      }
      overlay.open(target)
      setState({
        enableTransition: open,
        open: true,
        placement: newPlacement,
        offset: { alignment, separation },
        title: info.title,
        description: info.description
      })
      await setProgress(info.index, user.id)
    }
  }

  const closePopper = () => {
    if (fadeout) {
      return
    }
    console.log('closing popper')
    setState({
      ...state,
      fadeout: setTimeout(() => setState({
        open: false
      }), 500)
    })
    overlay.close()
  }


  const POPPER_MODIFIERS = {
    offset: {
      offset: offset ? `${offset.alignment}, ${offset.separation}` : '0px, 0px'
    }
  }

  return (
    <>
      <InfoBoxContext.Provider value={{ open: openPopper, close: closePopper }}>
        {children}
      </InfoBoxContext.Provider>
      <Popper
        open={open}
        anchorEl={open && overlay.box && overlay.box.current ? overlay.box.current : undefined}
        placement={placement}
        modifiers={POPPER_MODIFIERS}
        className={`${classes.popper} ${enableTransition ? 'enableTransition' : ''}
                    ${fadeout ? 'fadeout' : ''}`}
      >
        <Paper elevation={0} className={classes.root}>
          <div className={classes.infoHeader}>
            <div
              className={classes.infoHeaderIcon}
            >
              <IconButton className={classes.infoIcon} onClick={() => null}>
                <InfoIcon className={classes.icon} />
              </IconButton>
            </div>
            <div className={classes.headerTitleContainer}>
              <Typography className={classes.title} variant='h6'>
                {title}
              </Typography>
            </div>
          </div>
          <Typography className={classes.body} variant='body1'>
            {description}
          </Typography>
          <Button aria-label='Close' className={classes.button} onClick={closePopper}>
            Close
          </Button>
        </Paper>
      </Popper>
    </>
  )
}

export const useInfoBox = () => useContext(InfoBoxContext)

export default InfoBox
