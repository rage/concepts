import { Typography } from '@material-ui/core'
import React from 'react'

const NotFoundView = ({ message = 'Not found' }) => (
  <div style={{ gridArea: 'content' }}>
    <Typography component='h1' variant='h2' align='center' color='textPrimary'>
      {message}
    </Typography>
  </div>
)

export default NotFoundView
