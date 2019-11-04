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
  official: undefined,
  frozen: undefined,
  tags: []
}

const CourseEditor = ({ submit, defaultValues, tagOptions, action = 'Create', cancel }) => {
  const classes = useStyles()
  const infoBox = useInfoBox()
  const [{ user }] = useLoginStateValue()
  const nameRef = useRef()
  const [input, setInput] = useState({
    ...initialState,
    ...defaultValues,
    tags: defaultValues.tags ? backendToSelect(defaultValues.tags) : []
  })
  const [themeInput, setThemeInput] = useState('')

  const onSubmit = evt => {
    evt.preventDefault()
    submit({ ...input, tags: selectToBackend(input.tags) })
    if (action === 'Create') {
      nameRef.current.focus()
      setInput({ ...initialState, ...defaultValues })
      setThemeInput('')
    }
  }

  const onKeyDown = evt => {
    if (cancel && evt.key === 'Escape') {
      cancel()
    }
  }

  const handleKeyDownSelect = event => {
    if (!themeInput) return
    if (event.key === 'Tab' || event.key === 'Enter') {
      setInput({
        ...input,
        tags: [...input.tags, onTagCreate(themeInput)]
      })
      setThemeInput('')
      event.preventDefault()
    }
  }

  const infoBoxSelectRef = infoBox.ref('manager', 'CREATE_COURSE_THEMES')
  const selectRef = useRef(null)
  return (
    <form className={classes.form} onSubmit={onSubmit} onKeyDown={onKeyDown}>
      <TextField
        className={classes.textfield}
        variant='outlined'
        margin='dense'
        name='courseName'
        label='Course name'
        type='text'
        value={input.name}
        fullWidth
        inputRef={nameRef}
        ref={action === 'Create' ? infoBox.ref('manager', 'CREATE_COURSE_NAME') : undefined}
        autoFocus={action !== 'Create'}
        onChange={evt => setInput({ ...input, name: evt.target.value })}
      />
      <Select
        onChange={selected => setInput({ ...input, tags: selected || [] })}
        onKeyDown={handleKeyDownSelect}
        onInputChange={value => setThemeInput(value)}
        styles={tagSelectStyles}
        value={input.tags}
        options={tagOptions}
        ref={elem => {
          if (action === 'Create' && elem?.select?.select) {
            infoBoxSelectRef(elem.select.select.controlRef)
            selectRef.current = elem.select.select
          }
        }}
        onMenuOpen={() => {
          setTimeout(() => {
            const func = infoBox.secondaryRef('manager', 'CREATE_COURSE_THEMES')
            func(selectRef.current?.menuListRef)
          }, 0)
        }}
        onMenuClose={() => infoBox.secondaryRef('manager', 'CREATE_COURSE_THEMES', true)(null)}
        isMulti
        menuPlacement='auto'
        placeholder='Themes...'
        menuPortalTarget={document.body}
        inputValue={themeInput}
      />
      <Button
        color='primary' variant='contained' disabled={!input.name} type='submit'
        ref={action === 'Create' ? infoBox.ref('manager', 'CREATE_COURSE_SUBMIT') : undefined}
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
          ref={action === 'Create' ? infoBox.ref('manager', 'CREATE_COURSE_OFFICIAL') : undefined}
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
          ref={action === 'Create' ? infoBox.ref('manager', 'CREATE_COURSE_FROZEN') : undefined}
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

export default CourseEditor
