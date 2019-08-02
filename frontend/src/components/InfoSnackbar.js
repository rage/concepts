import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { IconButton, Snackbar, SnackbarContent } from '@material-ui/core'
import { Close as CloseIcon, Error as ErrorIcon, Info as InfoIcon } from '@material-ui/icons'

import { useMessageStateValue } from '../store'

const useStyles = makeStyles(theme => ({
  error: {
    backgroundColor: theme.palette.error.dark
  },
  notification: {
    backgroundColor: theme.palette.primary.dark
  },
  icon: {
    fontSize: 20
  },
  errorIcon: {
    marginRight: theme.spacing(1)
  },
  snackbar: {
    margin: theme.spacing(4)
  },
  message: {
    display: 'flex',
    alignItems: 'center'
  }
}))

const InfoSnackbar = () => {
  const [{ error, notification }, dispatchMessage] = useMessageStateValue()

  const classes = useStyles()

  const handleCloseErrorMessage = () => {
    dispatchMessage({
      type: 'clearError'
    })
  }

  const handleCloseNotificationMessage = () => {
    dispatchMessage({
      type: 'clearNotification'
    })
  }

  return <>
    <Snackbar open={error !== ''}
      onClose={handleCloseErrorMessage}
      ClickAwayListenerProps={{ onClickAway: () => null }}
      autoHideDuration={4000}
      className={classes.snackbar}
      ContentProps={{
        'aria-describedby': 'message-id'
      }}
    >
      <SnackbarContent className={classes.error}
        action={[
          <IconButton
            key='close'
            aria-label='Close'
            color='inherit'
            onClick={handleCloseErrorMessage}
          >
            <CloseIcon className={classes.icon} />
          </IconButton>
        ]}
        message={
          <span className={classes.message} id='error-message-id'>
            <ErrorIcon className={classes.errorIcon} />
            {error}
          </span>}
      />
    </Snackbar>

    <Snackbar open={notification !== ''}
      onClose={handleCloseNotificationMessage}
      ClickAwayListenerProps={{ onClickAway: () => null }}
      autoHideDuration={4000}
      className={classes.snackbar}
      ContentProps={{
        'aria-describedby': 'message-id'
      }}
    >
      <SnackbarContent className={classes.notification}
        action={[
          <IconButton
            key='close'
            aria-label='Close'
            color='inherit'
            onClick={handleCloseNotificationMessage}
          >
            <CloseIcon className={classes.icon} />
          </IconButton>
        ]}
        message={
          <span className={classes.message} id='notification-message-id'>
            <InfoIcon className={classes.errorIcon} />
            {notification}
          </span>}
      />
    </Snackbar>
  </>
}

export default InfoSnackbar
