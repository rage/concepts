import React, { useRef, useState } from 'react'
import { Button, Checkbox, FormControl, FormControlLabel, TextField } from '@material-ui/core'
import Select from 'react-select/creatable'

import { useInfoBox } from '../../components/InfoBox'
import { useLoginStateValue } from '../../lib/store'
import {
  backendToSelect, onTagCreate, selectToBackend, tagSelectStyles
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

const ConceptEditor = ({ submit, defaultValues = {}, tagOptions, action = 'Create', cancel, level }) => {
  const classes = useStyles()
  const infoBox = useInfoBox()
  const [{ user }] = useLoginStateValue()
  const nameRef = useRef()
  const [input, setInput] = useState({
    ...initialState,
    ...defaultValues,
    level,
    tags: defaultValues.tags ? backendToSelect(defaultValues.tags) : []
  })

  const onSubmit = evt => {
    evt.preventDefault()
    delete input.bloomTag
    submit({
      ...input,
      tags: selectToBackend(input.tags)
    })
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

  const onChange = evt => setInput({ ...input, [evt.target.name]: evt.target.value })

  const infoBoxSelectRef = infoBox.ref('manager', 'CREATE_CONCEPT_TAGS')
  const selectRef = useRef(null)
  return (
    <form className={classes.form} onSubmit={onSubmit} onKeyDown={onKeyDown}>
      <TextField
        className={classes.textfield}
        variant='outlined'
        margin='dense'
        name='name'
        label={`${level.charAt(0).toUpperCase() + level.substring(1)} name`}
        type='text'
        value={input.name}
        fullWidth
        inputRef={nameRef}
        ref={action === 'Create' ? infoBox.ref('manager', 'CREATE_CONCEPT_NAME') : undefined}
        autoFocus={action !== 'Create'}
        onChange={onChange}
      />
      <TextField
        className={classes.textfield}
        variant='outlined'
        margin='dense'
        name='description'
        label={`${level.charAt(0).toUpperCase() + level.substring(1)} description`}
        type='text'
        value={input.description}
        ref={action === 'Create' ? infoBox.ref('manager', 'CREATE_CONCEPT_DESCRIPTION') : undefined}
        fullWidth
        onChange={onChange}
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
        ref={elem => {
          if (action === 'Create' && elem?.select?.select) {
            infoBoxSelectRef(elem.select.select.controlRef)
            selectRef.current = elem.select.select
          }
        }}
        onMenuOpen={() => {
          setTimeout(() => {
            const func = infoBox.secondaryRef('manager', 'CREATE_CONCEPT_TAGS')
            func(selectRef.current?.menuListRef)
          }, 0)
        }}
        onMenuClose={() => infoBox.secondaryRef('manager', 'CREATE_CONCEPT_TAGS', true)(null)}
        isMulti
        placeholder='Select tags...'
        menuPlacement='auto'
        menuPortalTarget={document.body}
      />
      <Button
        color='primary' variant='contained' disabled={!input.name} type='submit'
        ref={action === 'Create' ? infoBox.ref('manager', 'CREATE_CONCEPT_SUBMIT') : undefined}
        className={classes.submit}
      >
        {action}
      </Button>
      {cancel &&
      <Button color='primary' variant='contained' onClick={cancel} className={classes.cancel}>
        Cancel
      </Button>
      }
      {user.role >= Role.STAFF && <>
        <FormControl
          ref={action === 'Create' ? infoBox.ref('manager', 'CREATE_CONCEPT_OFFICIAL') : undefined}
          style={{ verticalAlign: 'middle', marginLeft: '12px' }}
        >
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
        <FormControl
          ref={action === 'Create' ? infoBox.ref('manager', 'CREATE_CONCEPT_FROZEN') : undefined}
          style={{ verticalAlign: 'middle', marginLeft: '12px' }}
        >
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
      </>}
    </form>
  )
}

export default ConceptEditor
