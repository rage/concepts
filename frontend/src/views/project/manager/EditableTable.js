import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Table, TableBody, TableCell, TableHead,
  TableRow, Card, TextField, IconButton, CardHeader
} from '@material-ui/core'
import {
  Add as AddIcon, Delete as DeleteIcon,  Edit as EditIcon, Done as DoneIcon, Clear as ClearIcon
} from '@material-ui/icons'
import { DateTimePicker } from '@material-ui/pickers'
import moment from 'moment'

const useStyles = makeStyles(theme => ({
  root: {
    ...theme.mixins.gutters(),
    width: '100%',
    height: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto'
  },
  table: {
    width: '100%',
    flex: 1,
    overflow: 'auto'
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

const DATETIME_FORMAT = 'D.M.YYYY, HH:mm'
const formatDate = date => moment(date).format(DATETIME_FORMAT)
const tempDate = new Date()

const rows = [
  createData(1, 'osa01', tempDate, tempDate, 24, 4.0),
  createData(2, 'osa02', tempDate, tempDate, 37, 4.3),
  createData(3, 'osa03', tempDate, tempDate, 24, 6.0),
  createData(4, 'osa04', tempDate, tempDate, 67, 4.3),
  createData(5, 'osa05', tempDate, tempDate, 49, 3.9)
]

const columns = [
  { title: 'Group', field: 'groupName', type: 'text', minWidth: '80px' },
  { title: 'Start date', field: 'startDate', type: 'date', minWidth: '80px' },
  { title: 'End date', field: 'endDate', type: 'date', minWidth: '80px' },
  { title: 'Max points', field: 'maxPoints', type: 'number', min: '0', minWidth: '40px' },
  {
    title: 'Points per concept',
    field: 'pointsPerConcept',
    type: 'number',
    step: '0.1',
    min: '0.0',
    minWidth: '40px'
  }
]

const setPlaceholder = (type, title) => {
  switch (type) {
  case 'number':
    return null
  case 'text':
    return title
  default:
    return ''
  }
}

const setDefaultValue = (type) => {
  switch (type) {
  case 'number':
    return 1
  case 'text':
    return ''
  case 'date':
    return new Date().toISOString()
  default:
    return ''
  }
}

const EditableTable = () => {
  const classes = useStyles()
  const [editing, setEditing] = useState(null)
  const [state, setState] = useState(Object.fromEntries(columns.map(col =>
    [col.field, setDefaultValue(col.type)])))

  const handleChange = (evt) => setState({ ...state, [evt.target.name]: evt.target.value })

  return (
    <Card className={classes.root} elevation={0}>
      <CardHeader action={
        <IconButton aria-label='Add' onClick={() => setEditing('ADD')}>
          <AddIcon />
        </IconButton>}
      title={'Point groups'}
      />
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
          {
            editing && !rows.find(data => data.id === editing) &&
            <TableRow>
              {columns.map(col => <TableCell key={col.field} className={classes.tableCell}>
                {col.type === 'date' ?
                  <DateTimePicker
                    disablePast
                    ampm={false}
                    value={state[col.field]}
                    onChange={(value) => {
                      setState({ ...state, [col.field]: value })
                    }} />
                  :
                  <TextField
                    name={col.field}
                    value={state[col.field]}
                    className={classes.textField}
                    type={col.type}
                    placeholder={setPlaceholder(col.type, col.title)}
                    onChange={handleChange}
                    margin='none'
                    inputProps={{
                      step: col.step,
                      min: col.min
                    }}
                  />
                }
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
          }
        </TableBody>
      </Table>
    </Card>
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
        {col.type === 'date' ?
          <DateTimePicker
            disablePast
            ampm={false}
            value={state[col.field]}
            format={DATETIME_FORMAT}
            onChange={(value) => {
              setState({ ...state, [col.field]: value })
            }}
          />
          :
          <TextField
            name={col.field}
            className={classes.textField}
            type={col.type}
            value={state[col.field]}
            onChange={handleChange}
            margin='none'
            inputProps={{
              step: col.step,
              min: col.min
            }}
          />
        }

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
        {col.type === 'date' ? formatDate(data[col.field]) : data[col.field] }
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
