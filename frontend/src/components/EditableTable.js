import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Table, TableBody, TableCell, TableHead,
  TableRow, Card, TextField, IconButton, CardHeader, Tooltip
} from '@material-ui/core'
import {
  Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Done as DoneIcon, Clear as ClearIcon
} from '@material-ui/icons'
import { DateTimePicker } from '@material-ui/pickers'
import moment from 'moment'

import { useMessageStateValue } from '../lib/store'

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
  tableRowDisabled: {
    color: 'rgba(0, 0, 0, 0.26)'
  },
  tableCell: {
    color: 'inherit',
    padding: theme.spacing(1, 1)
  },
  buttonGroup: {
    '& > *': {
      marginRight: '6px',
      marginBottom: '4px'
    }
  }
}))

const NEW_ROW = 'NEW'

const DATETIME_FORMAT = 'D.M.YYYY, HH:mm'

const noop = val => val
const returnValue = val => () => val

const TextViewCell = ({ value }) => value || null
const TextEditCell = ({ col, state, setState }) => (
  <TextField
    name={col.field}
    value={state[col.field]}
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

const DateViewCell = ({ value }) => moment(value).format(DATETIME_FORMAT)
const DateEditCell = ({ col, state, setState }) => (
  <DateTimePicker
    disablePast
    ampm={false}
    value={state[col.field]}
    format={DATETIME_FORMAT}
    onChange={value => setState({ ...state, [col.field]: value })}
  />
)

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

const EditableTable = ({
  columns, rows, AdditionalAction, createMutation, updateMutation, deleteMutation, disabled, title, createButtonTitle
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
      setEditing(null)
      setState(Object.fromEntries(columns.map(col => [col.field, col.type.defaultValue])))
    } catch (err) {
      messageDispatch({
        type: 'setError',
        data: 'Access denied'
      })
    }
  }

  const createButton = (
      <IconButton aria-label='Add' disabled={disabled} onClick={() => setEditing(NEW_ROW)}>
        <AddIcon />
      </IconButton>
  )

  return (
    <Card className={classes.root} elevation={0}>
      <CardHeader
        action={(createMutation || AdditionalAction) && <div className={classes.buttonGroup}>
          {AdditionalAction && <AdditionalAction />}
          {createMutation &&
            Boolean(createButtonTitle) ? 
              <Tooltip title={createButtonTitle}>
                <span>
                  {createButton}
                </span>
              </Tooltip> : createButton
          }
        </div>}
        title={title}
      />
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            {columns.map(col => !col.hidden &&
              <TableCell key={col.field} className={classes.tableCell}>{col.title}</TableCell>
            )}
            <TableCell align='right' className={classes.tableCell}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(data => (
            <EditableTableRow
              key={data.id}
              data={data}
              disabled={disabled || data.disabled}
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

const EditTableRow = ({ columns, classes, state, setState, disabled, submit, cancel }) => (
  <TableRow>
    {columns.map(col => !col.hidden && (
      <TableCell key={col.field} className={classes.tableCell}>
        {!col.readOnly
          ? <col.type.EditComponent classes={classes} col={col} state={state} setState={setState} />
          : <col.type.DisplayComponent classes={classes} col={col} value={state[col.field]} />
        }
      </TableCell>
    ))}
    <TableCell className={classes.tableCell} align='right' style={{ minWidth: '120px' }}>
      <IconButton
        onClick={submit}
        disabled={disabled || columns
          .find(col => col.required && !state[col.field]) !== undefined}>
        <DoneIcon />
      </IconButton>
      <IconButton disabled={disabled} onClick={cancel}>
        <ClearIcon />
      </IconButton>
    </TableCell>
  </TableRow>
)

const DisplayTableRow = ({
  columns, classes, data, editing, setEditing, disabled, iconColor, deleteRow
}) => (
    <TableRow className={editing && editing !== data.id ? classes.tableRowDisabled : ''}>
      {columns.map(col => !col.hidden && (
        <TableCell key={col.field} className={classes.tableCell}>
          <col.type.DisplayComponent classes={classes} col={col} value={data[col.field]} />
        </TableCell>
      ))}
      <TableCell className={classes.tableCell} align='right' style={{ minWidth: '120px' }}>
        <IconButton color={iconColor} disabled={disabled} onClick={() => setEditing(data.id)}>
          <EditIcon />
        </IconButton>
        <IconButton color={iconColor} disabled={disabled} onClick={() => deleteRow(data.id)}>
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  )

const EditableTableRow = ({
  data, columns, disabled, editing, setEditing, updateMutation, deleteMutation
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
      if (response) {
        setState(Object.fromEntries(columns.map(col =>
          [col.field, response.hasOwnProperty(col.field) ? response[col.field] : state[col.field]]
        )))
      }
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
