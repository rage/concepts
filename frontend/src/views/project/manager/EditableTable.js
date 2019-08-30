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
  tableRowDisabled: {
    color: 'rgba(0, 0, 0, 0.26)'
  },
  tableCell: {
    color: 'inherit',
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

// const columns = ['Group', 'Start date', 'End date', 'Max points', 'Points per concept']

const columns = [
  { title: 'Group', field: 'groupName', type: 'text' },
  { title: 'Start date', field: 'startDate', type: 'date' },
  { title: 'End date', field: 'endDate', type: 'date' },
  { title: 'Max points', field: 'maxPoints', type: 'number' },
  { title: 'Points per concept', field: 'pointsPerConcept', type: 'number', step: '0.1' }
]

const EditableTable = () => {
  const classes = useStyles()
  const [editing, setEditing] = useState(null)

  return (
    <Paper className={classes.root} elevation={0}>
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            {columns.map(col =>
              <TableCell key={col.field} className={classes.tableCell}>{col.title}</TableCell>)}
            <TableCell align='center' className={classes.tableCell}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(data => (
            <EditableTableRow
              key={data.id}
              data={data}
              editing={editing}
              columns={columns}
              setEditing={setEditing}
            />
          ))}
        </TableBody>
      </Table>
    </Paper>
  )
}

const EditableTableRow = ({ data, columns, editing, setEditing }) => {
  const classes = useStyles()
  const [state, setState] = useState(Object.fromEntries(columns.map(col =>
    [col.field, data[col.field]])))

  const handleChange = (evt) => setState({ ...state, [evt.target.name]: evt.target.value })

  if (editing === data.id) {
    return <TableRow>
      {columns.map(col => <TableCell key={col.field} className={classes.tableCell}>
        <TextField
          name={col.field}
          className={classes.textField}
          type={col.type}
          defaultValue={data[col.field]}
          onChange={handleChange}
          margin='none'
          inputProps={{
            step: col.step
          }}
        />
      </TableCell>
      )}
      <TableCell className={classes.tableCell} align='center' style={{ minWidth: '140px' }}>
        <div style={{ display: 'inline' }} onClick={() => setEditing(null)}>
          <IconButton>
            <DoneIcon />
          </IconButton>
        </div>
        <div style={{ display: 'inline' }} onClick={() => setEditing(null)}>
          <IconButton>
            <ClearIcon />
          </IconButton>
        </div>
      </TableCell>
    </TableRow>
  } else {
    const iconColor = editing && editing !== data.id ? 'inherit' : undefined

    return <TableRow className={editing && editing !== data.id ? classes.tableRowDisabled : ''}>
      {columns.map(col => <TableCell key={col.field} className={classes.tableCell}>
        {data[col.field]}
      </TableCell>
      )}
      <TableCell className={classes.tableCell} align='center' style={{ minWidth: '140px' }}>
        <div style={{ display: 'inline' }} onClick={() => setEditing(data.id)}>
          <IconButton color={iconColor}>
            <EditIcon />
          </IconButton>
        </div>
        <div style={{ display: 'inline' }}>
          <IconButton color={iconColor}>
            <DeleteIcon />
          </IconButton>
        </div>
      </TableCell>
    </TableRow>
  }
}

export default EditableTable
