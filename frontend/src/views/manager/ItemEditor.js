import React, { useRef, useState } from 'react'
import {
  Button,
  Checkbox,
  FormControl, FormControlLabel,
  TextField
} from '@material-ui/core'
import Select from 'react-select/creatable'
import { useLoginStateValue } from '../../lib/store'
import {
  backendToSelect,
  selectToBackend,
  onTagCreate,
  tagSelectStyles
} from '../../dialogs/tagSelectUtils'
import { Role } from '../../lib/permissions'
import useStyles from './editorStyles'

const initialState = {
  name: '',
  description: '',
  tags: [],
  bloomTag: '',
  official: undefined,
  frozen: undefined
}

const ConnectableSubmitButton = ({ disabled, ref }) => {
  const classes = useStyles()

  return (<Button
    color='primary' 
    variant='contained' 
    disabled={disabled} 
    type='submit'
    ref={ref}
    className={classes.submit}>
      submit
  </Button>)
}

const ConnectableTextfield = ({ value, name, label, inputRef, onChange, autoFocus, ref }) => {
  const classes = useStyles()

  return (<TextField
    className={classes.textfield}
    variant='outlined'
    margin='dense'
    name={name}
    label={label}
    type='text'
    value={value}
    fullWidth
    inputRef={inputRef}
    onChange={onChange}
    autoFocus={autoFocus}
    ref={ref}
  />)
}

const StaffArea = ({children}) => {
  const [{ user }] = useLoginStateValue()
  return (
    <> { user.role >= Role.STAFF && children } </>
  )
}

const ItemEditor = ({ 
  submit,
  cancel, 
  action,
  tagOptions,
  defaultValues = {}, 
}) => {
  const classes = useStyles()
  const [{ user }] = useLoginStateValue()
  const [input, setInput] = useState({
    ...initialState,
    ...defaultValues,
    tags: defaultValues.tags ? backendToSelect(defaultValues.tags) : []
  })
  
  const nameRef = useRef()
  const selectRef = useRef(null) 
  const levelName = input.level.charAt(0).toUpperCase() + input.level.slice(1)

  const onSubmit = event => {
    event.preventDefault()
    submit({
      ...input,
      tags: selectToBackend(input.tags)
    })
    if (action === 'Create') {
      nameRef.current.focus()
      setInput({...initialState, ...defaultValues })
    }
  }

  const onKeyDown = event => {
    if (cancel && event.key === 'Escape') {
      cancel()
    }
  }

  const onChange = event => setInput({ ...input, [event.target.name]: event.target.value })

  return (
    <form 
      className={classes.form}
      onSubmit={onSubmit}
      onKeyDown={onKeyDown}
    >
      <ConnectableTextfield 
        name="name" 
        label={`${levelName} name`}
        inputRef={nameRef} 
        onChange={onChange}
        value={input.name}
      />
      <ConnectableTextfield 
        name="description" 
        label={`${levelName} description`}
        autoFocus={action !== 'Create'}
        onChange={onChange}
        value={input.description}
      />
      <Select
        onChange={selected => setInput({ ...input, tags: selected || [] })}
        onCreateOption={newOption => setInput({
          ...input,
          tags: [...input.tags, onTagCreate(newOption)]
        })}
        styles={tagSelectStyles}
        options={tagOptions}
        value={input.tags}
        isMulti
        placeholder='Select tags...'
        menuPlacement='auto'
        ref={element => {
          if (action === 'Create' && element?.select?.select) {
            selectRef.current = element.select.select
          }
        }}
        menuPortalTarget={document.body}
      />
      <ConnectableSubmitButton disabled={!input.name}/>
      {cancel &&
        <Button color='primary' variant='contained' onClick={cancel} className={classes.cancel}>
          Cancel
        </Button>
      }

      <StaffArea >
        <FormControl className={classes.formControl}>
          <FormControlLabel
            control={
              <Checkbox
                checked={input.official}
                onChange={event => setInput({ ...input, official: event.target.checked })}
                value='official'
                color='primary'
              />
            }
            label='Official'
          />
        </FormControl>
        <FormControl className={classes.formControl}>
          <FormControlLabel
            control={
              <Checkbox
                checked={input.frozen}
                onChange={event => setInput({ ...input, frozen: event.target.checked })}
                value='frozen'
                color='primary'
              />
            }
            label='Frozen'
          />
        </FormControl>
      </StaffArea>
    </form>
  )
}

export default ItemEditor