import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc'
import { List, ListItem, ListItemIcon } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { DragHandle as DragIcon } from '@material-ui/icons'
import React from 'react'

const useStyles = makeStyles({
  dragHandle: {
    padding: '12px',
    verticalAlign: 'middle',
    minWidth: '48px'
  }
})

export const DragHandle = SortableHandle(() => {
  const classes = useStyles()
  return <ListItemIcon className={classes.dragHandle}>
    <DragIcon />
  </ListItemIcon>
})

export const SortableItem = SortableElement(ListItem)
export const SortableList = SortableContainer(List)
