import React, { useRef, useState } from 'react'
import {
  Button, Checkbox, FormControl, FormControlLabel,
  TextField
} from '@material-ui/core'
import Select from 'react-select/creatable'
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete'

import { useLoginStateValue } from '../../lib/store'
import {
  backendToSelect, selectToBackend, onTagCreate, tagSelectStyles
} from '../../dialogs/tagSelectUtils'
import { Role } from '../../lib/permissions'
import useStyles from './editorStyles'

const initialState = {
  name: '',
  common: null,
  useCommon: false,
  description: '',
  tags: [],
  bloomTag: '',
  official: undefined,
  frozen: undefined
}

const ConnectableSubmitButton = ({ disabled, ref, action }) => {
  const classes = useStyles()

  return (
    <Button
      color='primary'
      variant='contained'
      disabled={disabled}
      type='submit'
      ref={ref}
      className={classes.submit}
    >
      { action }
    </Button>
  )
}

const ConnectableTextfield = ({ value, name, label, inputRef, onChange, autoFocus, ref }) => {
  const classes = useStyles()

  return <TextField
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
  />
}

const StaffOnly = ({ children }) => {
  const [{ user }] = useLoginStateValue()
  return user.role >= Role.STAFF && children
}

const ConceptEditor = ({
  submit,
  cancel,
  action,
  tagOptions,
  defaultValues = {},
  commonConcepts,
  commonSubmit
}) => {
  const classes = useStyles()
  const [input, setInput] = useState({
    ...initialState,
    ...defaultValues,
    tags: defaultValues.tags ? backendToSelect(defaultValues.tags) : []
  })

  const nameRef = useRef()
  const selectRef = useRef(null)

  const onSubmit = evt => {
    console.log(input)
    if (evt) evt.preventDefault()
    if (input.useCommon) {
      const commonConceptId = input.common.id
      delete input.bloomTag
      delete input.common
      delete input.useCommon
      commonSubmit({
        ...input,
        conceptId: commonConceptId,
        tags: selectToBackend(input.tags)
      })
      // TODO use input.common
    } else {
      delete input.bloomTag
      delete input.common
      delete input.useCommon
      submit({
        ...input,
        tags: selectToBackend(input.tags)
      })
    }
    if (action === 'Create') {
      nameRef.current.focus()
      setInput({ ...initialState, ...defaultValues })
    }
  }

  const onKeyDown = evt => {
    if (cancel && evt.key === 'Escape') {
      cancel()
    }
  }

  console.log(JSON.stringify(input))

  const onChange = evt => setInput({ ...input, [evt.target.name]: evt.target.value })
  const onNameInputChange = evt => setInput({ ...input, useCommon: false, name: evt.target.value })
  const onNameSelect = (_, newValue) => {
    if (typeof newValue !== 'object' && newValue !== null) {
      onSubmit()
    } else {
      setInput({
        ...input,
        useCommon: true,
        common: newValue || null,
        name: newValue?.name || ''
      })
    }
  }

  return (
    <form
      className={classes.form}
      onSubmit={onSubmit}
      onKeyDown={onKeyDown}
    >
      <Autocomplete
        freeSolo
        //TODO maybe exclude common concepts that have already been copied to this course
        options={action === 'Create' ? commonConcepts : []}
        getOptionLabel={concept => concept.name || 'undefined'}
        filterOptions={createFilterOptions({
          stringify: concept => concept.name || 'undefined'
        })}
        onChange={onNameSelect}
        value={input.common}
        inputValue={input.name}
        renderInput={params =>
          <TextField
            {...params} fullWidth name='name'
            label={`${input.level.toTitleCase()} name`} onChange={onNameInputChange}
            margin='dense' variant='outlined'
            // TODO this autofocus means the autocomplete box gets opened automatically
            inputRef={nameRef} autoFocus={action !== 'Create'}
          />
        }
      />
      <ConnectableTextfield
        name='description'
        label={`${input.level.toTitleCase()} description`}
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
      <ConnectableSubmitButton disabled={!input.name && !input.common} action={action} />
      {cancel &&
        <Button color='primary' variant='contained' onClick={cancel} className={classes.cancel}>
          Cancel
        </Button>
      }

      <StaffOnly>
        <FormControl className={classes.formControl}>
          <FormControlLabel
            control={
              <Checkbox
                checked={input.official}
                onChange={evt => setInput({ ...input, official: evt.target.checked })}
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
                onChange={evt => setInput({ ...input, frozen: evt.target.checked })}
                value='frozen'
                color='primary'
              />
            }
            label='Frozen'
          />
        </FormControl>
      </StaffOnly>
    </form>
  )
}

export default ConceptEditor
