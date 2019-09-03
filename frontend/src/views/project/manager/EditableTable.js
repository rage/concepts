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

const noop = val => val
const returnValue = val => () => val

const TextEditCell = ({ classes, col, state, setState }) => (
  <TextField
    name={col.field}
    value={state[col.field]}
    className={classes.textField}
    type={col.type.inputType}
    placeholder={col.type.placeholder(col)}
    onChange={evt => setState({ ...state, [col.field]: evt.target.value })}
    margin='none'
    inputProps={{
      step: col.step,
      min: col.min
    }}
  />
)

const DateEditCell = ({ col, state, setState }) => (
  <DateTimePicker
    disablePast
    ampm={false}
    value={state[col.field]}
    format={DATETIME_FORMAT}
    onChange={value => setState({ ...state, [col.field]: value })}
  />
)

const TextViewCell = ({ value }) => value

const DateViewCell = ({ value }) => moment(value).format(DATETIME_FORMAT)

const typeBase = {
  // Cast value before sending to server.
  cast: noop,
  // Get placeholder for column.
  placeholder: col => col.title,
  // The component to use for displaying the column.
  // Available props: classes, col, value
  DisplayComponent: TextViewCell,
  // The component to use when editing the column.
  // Available props: classes, col, state, setState
  EditComponent: TextEditCell,
  // The default value for the column.
  get defaultValue() {
    return ''
  }
}

export const Type = {
  NUMBER: {
    ...typeBase,
    cast: Number,
    placeholder: returnValue(null),
    defaultValue: 1,
    inputType: 'number'
  },
  TEXT: {
    ...typeBase
  },
  DATE: {
    ...typeBase,
    DisplayComponent: DateViewCell,
    EditComponent: DateEditCell,
    get defaultValue() {
      return new Date().toISOString()
    }
  }
}

const NEW_ROW = 'NEW'

const EditableTable = ({ columns, rows, AdditionalAction, createMutation,
  updateMutation, deleteMutation, disabled
}) => {
  const classes = useStyles()
  const [editing, setEditing] = useState(null)
  const [state, setState] = useState(Object.fromEntries(columns.map(col =>
    [col.field, col.type.defaultValue])))
  const [, messageDispatch] = useMessageStateValue()

  const handleCreate = async () => {
    if (disabled) return
    const variables = Object.fromEntries(columns
      .map(col => [col.field, col.type.cast(state[col.field])]))
    try {
      await createMutation(variables)
    } catch (err) {
      messageDispatch({
        type: 'setError',
        data: 'Access denied'
      })
    } finally {
      setEditing(null)
      setState(Object.fromEntries(columns.map(col => [col.field, col.type.defaultValue])))
    }
  }

  return (
    <Card className={classes.root} elevation={0}>
      <CardHeader
        action={<>
          <AdditionalAction />
          <IconButton aria-label='Add' disabled={disabled} onClick={() => setEditing(NEW_ROW)}>
            <AddIcon />
          </IconButton>
        </>}
        title='Point groups'
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
          {editing === NEW_ROW &&
            <EditTableRow
              columns={columns} classes={classes} state={state} setState={setState}
              disabled={disabled} submit={handleCreate} cancel={() => setEditing(null)}
            />
          }
        </TableBody>
      </Table>
    </Card>
  )
}

const EditTableRow = ({
  columns, classes, state, setState, disabled, submit, cancel
}) => (
  <TableRow>
    {columns.map(col => (
      <TableCell key={col.field} className={classes.tableCell}>
        <col.type.EditComponent classes={classes} col={col} state={state} setState={setState} />
      </TableCell>
    ))}
    <TableCell className={classes.tableCell} align='center' style={{ minWidth: '120px' }}>
      <div style={{ display: 'inline' }} onClick={submit}>
        <IconButton
          disabled={disabled || columns
            .find(col => col.required && !state[col.field]) !== undefined}
        >
          <DoneIcon />
        </IconButton>
      </div>
      <div style={{ display: 'inline' }} onClick={cancel}>
        <IconButton disabled={disabled}>
          <ClearIcon />
        </IconButton>
      </div>
    </TableCell>
  </TableRow>
)

const DisplayTableRow = ({
  columns, classes, data, editing, setEditing, disabled, iconColor, deleteRow
}) => (
  <TableRow className={editing && editing !== data.id ? classes.tableRowDisabled : ''}>
    {columns.map(col => (
      <TableCell key={col.field} className={classes.tableCell}>
        <col.type.DisplayComponent classes={classes} col={col} value={data[col.field]} />
      </TableCell>
    ))}
    <TableCell className={classes.tableCell} align='center' style={{ minWidth: '120px' }}>
      <div style={{ display: 'inline' }} onClick={() => setEditing(data.id)}>
        <IconButton color={iconColor} disabled={disabled}>
          <EditIcon />
        </IconButton>
      </div>
      <div style={{ display: 'inline' }} onClick={() => deleteRow(data.id)}>
        <IconButton color={iconColor} disabled={disabled}>
          <DeleteIcon />
        </IconButton>
      </div>
    </TableCell>
  </TableRow>
)

const EditableTableRow = ({
  data, columns, disabled,
  editing, setEditing,
  updateMutation, deleteMutation
}) => {
  const classes = useStyles()
  const [state, setState] = useState(Object.fromEntries(columns
    .map(col => [col.field, data[col.field]])))
  const [, messageDispatch] = useMessageStateValue()

  const handleUpdate = async () => {
    const variables = Object.fromEntries(columns
      .map(col => [col.field, col.type.cast(state[col.field])]))
    variables.id = editing
    try {
      const response = await updateMutation(variables)
      setEditing(null)
      const newData = response.data.updatePointGroup
      setState(Object.fromEntries(columns.map(col => [col.field, newData[col.field]])))
    } catch (err) {
      messageDispatch({
        type: 'setError',
        data: 'Access denied'
      })
    }
  }

  if (editing === data.id) {
    return <EditTableRow
      columns={columns} classes={classes} state={state} setState={setState} disabled={disabled}
      submit={handleUpdate} cancel={() => setEditing(null)}
    />
  } else {
    const iconColor = editing && editing !== data.id ? 'inherit' : undefined

    return <DisplayTableRow
      columns={columns} classes={classes} data={data} editing={editing} setEditing={setEditing}
      disabled={disabled} iconColor={iconColor} deleteRow={id => deleteMutation({ id })}
    />
  }
}

export default EditableTable
