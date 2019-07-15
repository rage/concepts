import React, { useState, createContext, useContext } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Button, Paper, Typography, IconButton, Popper, Fade } from '@material-ui/core'
import { InfoOutlined as InfoIcon } from '@material-ui/icons'

const useStyles = makeStyles(theme => ({
  root: {
    position: 'fixed',
    zIndex: '200',
    width: '400px',
    display: 'flex',
    flexDirection: 'column',
    padding: '16px 16px 8px 16px',
    boxSizing: 'border-box',
    backgroundColor: theme.palette.primary.main
  },
  popper: {
    zIndex: '200'
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
    open: false,
    offset: {
      alignment: '0px',
      separation: '0px'
    },
    title: 'InfoBox',
    description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, 
    sed do eiusmod tempor incididunt
    ut labore et dolore magna aliqua. Ut enim ad minim veniam, 
    quis nostrud exercitation.`
  })
  const classes = useStyles()

  const openPopper = (target, newPlacement, title, description, alignment = 0, separation = 0) => {
    setState({
      ...state,
      anchorEl: target,
      open: true,
      placement: newPlacement,
      offset: { alignment, separation },
      title,
      description
    })
  }

  const closePopper = () => {
    setState({
      open: false,
      offset: {
        alignment: '0px',
        separation: '0px'
      }
    })
  }

  const { title, description, anchorEl, open, offset, placement } = state

  const POPPER_MODIFIERS = {
    offset: {
      offset: `${offset.alignment}, ${offset.separation}`
    }
  }

  return (
    <>
      <InfoBoxContext.Provider value={{ open: openPopper, close: closePopper }}>
        {children}
      </InfoBoxContext.Provider>
      <Popper
        open={open}
        anchorEl={anchorEl}
        placement={placement}
        modifiers={POPPER_MODIFIERS}
        transition
        className={classes.popper}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={500}>

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
          </Fade>
        )}
      </Popper>
    </>
  )
}

export const useInfoBox = () => useContext(InfoBoxContext)

export default InfoBox
