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

import { useMessageStateValue } from '../../../store'

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

const DATETIME_FORMAT = 'D.M.YYYY, HH:mm'
const formatDate = date => moment(date).format(DATETIME_FORMAT)

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

const EditableTable = ({ columns, rows, AdditionalAction, createMutation,
  updateMutation, deleteMutation, disabled
}) => {
  const classes = useStyles()
  const [editing, setEditing] = useState(null)
  const [state, setState] = useState(Object.fromEntries(columns.map(col =>
    [col.field, setDefaultValue(col.type)])))
  const [, messageDispatch] = useMessageStateValue()

  const handleChange = evt => setState({ ...state, [evt.target.name]: evt.target.value })

  const handleCreate = () => {
    if (disabled) return
    const variables = {}
    for (const col of columns) {
      variables[col.field] = (col.type === 'number') ? Number(state[col.field]) : state[col.field]
    }
    createMutation(variables).catch(() => {
      messageDispatch({
        type: 'setError',
        data: 'Access denied'
      })
    })
      .finally(() => {
        setEditing(null)
        setState(Object.fromEntries(columns.map(col =>
          [col.field, setDefaultValue(col.type)])))
      })
  }

  return (
    <Card className={classes.root} elevation={0}>
      <CardHeader action={
        <>
          <AdditionalAction />
          <IconButton aria-label='Add' disabled={disabled} onClick={() => setEditing('ADD')}>
            <AddIcon />
          </IconButton>
        </>}
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
              disabled={disabled}
              editing={editing}
              columns={columns}
              updateMutation={updateMutation}
              deleteMutation={deleteMutation}
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
                    format={DATETIME_FORMAT}
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
              <TableCell className={classes.tableCell} align='center' style={{ minWidth: '120px' }}>
                <IconButton disabled={disabled} onClick={handleCreate}>
                  <DoneIcon />
                </IconButton>
                <IconButton disabled={disabled} onClick={() => setEditing(null)}>
                  <ClearIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          }
        </TableBody>
      </Table>
    </Card>
  )
}

const EditableTableRow = ({
  data, columns, disabled,
  editing, setEditing,
  updateMutation, deleteMutation
}) => {
  const classes = useStyles()
  const [state, setState] = useState(Object.fromEntries(columns.map(col =>
    [col.field, data[col.field]])))
  const [, messageDispatch] = useMessageStateValue()

  const handleChange = (evt) => setState({ ...state, [evt.target.name]: evt.target.value })

  const handleUpdate = () => {
    const variables = {}
    for (const col of columns) {
      variables[col.field] = (col.type === 'number') ? Number(state[col.field]) : state[col.field]
    }
    updateMutation({ id: editing, ...variables })
      .then(response => {
        setEditing(null)
        const newData = response.data.updatePointGroup
        setState(Object.fromEntries(columns.map(col =>
          [col.field, newData[col.field]])))
      }).catch(() => {
        messageDispatch({
          type: 'setError',
          data: 'Access denied'
        })
      })
  }

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
      <TableCell className={classes.tableCell} align='center' style={{ minWidth: '120px' }}>
        <div style={{ display: 'inline' }} onClick={handleUpdate}>
          <IconButton disabled={disabled}>
            <DoneIcon />
          </IconButton>
        </div>
        <div style={{ display: 'inline' }} onClick={() => setEditing(null)}>
          <IconButton disabled={disabled}>
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
      <TableCell className={classes.tableCell} align='center' style={{ minWidth: '120px' }}>
        <div style={{ display: 'inline' }} onClick={() => setEditing(data.id)}>
          <IconButton color={iconColor} disabled={disabled}>
            <EditIcon />
          </IconButton>
        </div>
        <div style={{ display: 'inline' }} onClick={() => deleteMutation({ id: data.id })}>
          <IconButton color={iconColor} disabled={disabled}>
            <DeleteIcon />
          </IconButton>
        </div>
      </TableCell>
    </TableRow>
  }
}

export default EditableTable
