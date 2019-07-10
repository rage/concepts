import React from 'react'

import { withStyles } from '@material-ui/core'

const styles = theme => ({
  masonry: {
    columnWidth: '296px',
    width: '100%',
    boxSizing: 'border-box'
  },
  columnWrapper: {
    overflow: 'hidden',
    breakInside: 'avoid-column',
    columnBreakInside: 'avoid',
    display: 'flex',
    justifyContent: 'center'
  }
})

const Masonry = ({ classes, children, courseTrayOpen }) => {
  return (
    <div className={`${classes.masonry} ${courseTrayOpen ? 'courseTrayOpen' : ''}`}>
      {children.map((child, i) => <div className={classes.columnWrapper} key={i}>
        {child}
      </div>)}
    </div>
  )
}

export default withStyles(styles)(Masonry)
