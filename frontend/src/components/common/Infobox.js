import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Button, Paper, Typography, IconButton } from '@material-ui/core'
import { InfoOutlined as InfoIcon } from '@material-ui/icons'

const useStyles = makeStyles(theme => ({
  root: {
    width: '400px',
    display: 'flex',
    flexDirection: 'column',
    padding: '16px 16px 8px 16px',
    boxSizing: 'border-box',
    backgroundColor: theme.palette.primary.main
  },
  infoHeader: {
    display: 'flex',
    alignItems: 'center'
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

const Infobox = () => {
  const classes = useStyles()
  return (
    <Paper elevation={0} className={classes.root} style={{ position: 'absolute', top: '50%', left: '50%' }}>

      <div className={classes.infoHeader}>
        <div
          style={{
            flex: '1 1 auto',
            marginTop: '-8px',
            marginLeft: '-13px',
            marginRight: '-4px',
            alignSelf: 'flex-start'
          }}
        >
          <IconButton className={classes.infoIcon} onClick={() => null}>
            <InfoIcon className={classes.icon} />
          </IconButton>
        </div>
        <div style={{ flex: '1 1 auto' }}>
          <Typography className={classes.title} variant='h6'>
            {'This is what you will learn'}
          </Typography>
        </div>
      </div>
      <Typography className={classes.body} variant='body1'>
        {` Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
            ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.`}
      </Typography>
      <Button aria-label='Close' className={classes.button}>
        Close
      </Button>
    </Paper>
  )
}

export default Infobox
