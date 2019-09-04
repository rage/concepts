import React from 'react'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'

const dividerLine = {
  backgroundColor: '#888',
  content: '""',
  display: 'inline-block',
  height: '1px',
  position: 'relative',
  verticalAlign: 'middle',
  width: '50%'
}

const useStyles = makeStyles({
  root: {
    'overflow': 'hidden',
    'textAlign': 'center',
    'color': '#333',
    '&:before': {
      ...dividerLine,
      right: '0.5em',
      marginLeft: '-50%'
    },
    '&:after': {
      ...dividerLine,
      left: '0.5em',
      marginRight: '-50%'
    }
  }
})

const DividerWithText = ({ content, gridArea, margin, hidden }) => {
  const classes = useStyles()

  return (
    <Typography
      className={classes.root}
      style={{ gridArea, margin, display: hidden ? 'none' : 'initial' }}
      variant='h6'
    >
      {content}
    </Typography>
  )
}

export default DividerWithText
