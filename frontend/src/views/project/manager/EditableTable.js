import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Table, TableBody, TableCell, TableHead,
  TableRow, Paper, TextField, IconButton
} from '@material-ui/core'
import {
  Delete as DeleteIcon,  Edit as EditIcon, Done as DoneIcon, Clear as ClearIcon
} from '@material-ui/icons'

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(3),
    overflowX: 'auto'
  },
  table: {
    width: '100%'
  },
  textField: {
  },
  tableCell: {
    padding: theme.spacing(1, 1)
  }
}))

function createData(id, groupName, startDate, endDate, maxPoints, pointsPerConcept) {
  return { id, groupName, startDate, endDate, maxPoints, pointsPerConcept }
}

const rows = [
  createData(1, 'osa01', Date(), Date(), 24, 4.0),
  createData(2, 'osa02', Date(), Date(), 37, 4.3),
  createData(3, 'osa03', Date(), Date(), 24, 6.0),
  createData(4, 'osa04', Date(), Date(), 67, 4.3),
  createData(5, 'osa05', Date(), Date(), 49, 3.9)
]

const headers = ['Group', 'Start date', 'End date', 'Max points', 'Points per concept']

const EditableTable = () => {
  const classes = useStyles()
  const [editing, setEditing] = useState(null)

  return (
    <Paper className={classes.root} elevation='0'>
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            {headers.map(columnName =>
              <TableCell className={classes.tableCell}>{columnName}</TableCell>)}
            <TableCell align='center' className={classes.tableCell}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(data => (
            <EditableTableRow
              key={data.id}
              data={data}
              editing={editing}
              setEditing={setEditing}
            />
          ))}
        </TableBody>
      </Table>
    </Paper>
  )
}

const EditableTableRow = ({ data, editing, setEditing }) => {
  const classes = useStyles()
  if (editing) {
    return <TableRow>
      <TableCell className={classes.tableCell}>
        <TextField
          className={classes.textField}
          defaultValue={data.groupName}
          onChange={() => {}}
          margin='none'
        />
      </TableCell>
      <TableCell className={classes.tableCell}>
        <TextField
          className={classes.textField}
          type='date'
          defaultValue={data.startDate}
          onChange={() => {}}
          InputLabelProps={{
            shrink: true
          }}
        />
      </TableCell>
      <TableCell className={classes.tableCell}>
        <TextField
          className={classes.textField}
          type='date'
          defaultValue={data.endDate}
          onChange={() => {}}
          InputLabelProps={{
            shrink: true
          }}
        />
      </TableCell>
      <TableCell className={classes.tableCell}>
        <TextField
          className={classes.textField}
          type='number'
          defaultValue={data.maxPoints}
          onChange={() => {}}
          margin='none'
        />
      </TableCell>
      <TableCell className={classes.tableCell}>
        <TextField
          className={classes.textField}
          defaultValue={data.pointsPerConcept}
          onChange={() => {}}
          margin='none'
        />
      </TableCell>
      <TableCell className={classes.tableCell} align='center' style={{ minWidth: '140px' }}>
        <IconButton onClick={() => setEditing(null)}>
          <DoneIcon />
        </IconButton>
        <IconButton>
          <ClearIcon onClick={() => setEditing(null)} />
        </IconButton>
      </TableCell>
    </TableRow>
  } else {
    return <TableRow>
      <TableCell className={classes.tableCell}>{data.groupName}</TableCell>
      <TableCell className={classes.tableCell}>{data.startDate}</TableCell>
      <TableCell className={classes.tableCell}>{data.endDate}</TableCell>
      <TableCell className={classes.tableCell}>{data.maxPoints}</TableCell>
      <TableCell className={classes.tableCell}>{data.pointsPerConcept}</TableCell>
      <TableCell className={classes.tableCell} align='center'  style={{ minWidth: '140px' }}>
        <IconButton onClick={() => setEditing(data.groupName)}>
          <EditIcon />
        </IconButton>
        <IconButton>
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  }
}

export default EditableTable
