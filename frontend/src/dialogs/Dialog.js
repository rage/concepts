import React, { useState, useRef } from 'react'
import {
  Dialog as MuiDialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button,
  TextField, FormControlLabel, Checkbox, FormControl
} from '@material-ui/core'
import Select from 'react-select/creatable'

import { useMessageStateValue } from '../store'
import { noDefault } from '../lib/eventMiddleware'

const blankState = () => ({
  open: false,
  submitDisabled: false,
  mutation: null,
  createOptimisticResponse: null,
  requiredVariables: [],
  actionText: '',
  fields: [],
  title: '',
  content: [],
  CustomActions: null,
  customActionsProps: null,
  type: ''
})

const OptionalForm = ({ enable, onSubmit, children }) => {
  if (!enable) {
    return children
  }
  return <form onSubmit={noDefault(onSubmit)}>
    {children}
  </form>
}

const Dialog = ({ contextRef }) => {
  const stateChange = useRef(-1)
  const [state, setState] = useState(blankState())
  const [inputState, setInputState] = useState(null)
  const [, messageDispatch] = useMessageStateValue()

  const setSubmitDisabled = submitDisabled => setState({ ...state, submitDisabled })

  const closeDialog = () => {
    clearTimeout(stateChange.current)
    setState({ ...state, open: false })
    stateChange.current = setTimeout(() => {
      setState(blankState())
      setInputState(null)
    }, 250)
  }

  const handleSubmit = async (close) => {
    if (state.submitDisabled) return
    const variables = {}
    for (const key of state.fields) {
      let data = inputState[key.name]
      if (typeof data === 'string') {
        data = data.trim()
      }
      if (key.list && !variables[key.list]) variables[key.list] = []
      if (!data) {
        if (key.required) {
          window.alert(`${state.type} needs a ${key.name}!`)
          return
        }
        if (key.omitEmpty) continue
      }
      if (key.valueMutator) {
        data = key.valueMutator(data)
        if (!data) return
      }
      if (key.list) variables[key.list].push(data)
      else variables[key.name] = data
    }
    setSubmitDisabled(true)

    const closeFnc = close ? closeDialog : () => setSubmitDisabled(false)
    const mutationArgs = {
      variables: { ...state.requiredVariables, ...variables },
      optimisticResponse: state.createOptimisticResponse ? state.createOptimisticResponse({
        ...state.requiredVariables, ...variables
      }) : undefined
    }
    if (state.createOptimisticResponse) closeFnc()
    try {
      await state.mutation(mutationArgs)
    } catch (e) {
      messageDispatch({
        type: 'setError',
        data: 'Access denied'
      })
    }
    if (!state.createOptimisticResponse) closeFnc()
  }

  const setCheckboxValue = key =>
    key.hasOwnProperty('defaultValue') ? key.defaultValue : false

  contextRef.current.setSubmitDisabled = setSubmitDisabled
  contextRef.current.closeDialog = closeDialog
  contextRef.current.inputState = inputState

  contextRef.current.openDialog = ({
    mutation, requiredVariables, actionText, fields, title, content, CustomActions,
    customActionsProps, type, createOptimisticResponse
  }) => {
    clearTimeout(stateChange.current)
    if (fields) {
      setInputState(Object.fromEntries(fields.map(key =>
        [key.name, key.type === 'checkbox' ? setCheckboxValue(key) : key.defaultValue || ''])))
    }
    setState({
      open: true,
      submitDisabled: false,
      mutation,
      createOptimisticResponse,
      requiredVariables,
      actionText,
      fields: fields
        ? fields.map(field => typeof field === 'string' ? { name: field } : field)
          .filter(field => !field.hidden)
        : [],
      title,
      content: content || [],
      CustomActions,
      customActionsProps,
      type
    })
  }

  contextRef.current.updateDialog = ({ ...data }) => {
    setState({
      ...state,
      ...data
    })
  }
  const onChange = evt => setInputState({ ...inputState, [evt.target.name]: evt.target.value })

  const requiredMissing = Boolean(state.fields.find(field =>
    !inputState[field.name] && field.required))

  const { CustomActions } = state
  return (
    <MuiDialog open={state.open} onClose={closeDialog}>
      <DialogTitle>{state.title}</DialogTitle>
      <OptionalForm enable={state.fields.length > 0} onSubmit={handleSubmit}>
        <DialogContent>
          {
            state.content.map((contentText, i) =>
              <DialogContentText key={i}>
                {contentText}
              </DialogContentText>
            )
          }
          {
            state.fields.map((field, index) => {
              if (!field.type || field.type === 'textfield') {
                return <TextField
                  key={field.name}
                  autoFocus={index === 0}
                  variant='outlined'
                  margin='dense'
                  name={field.name}
                  label={field.name[0].toUpperCase() + field.name.substr(1)}
                  type='text'
                  rows={2}
                  rowsMax={10}
                  value={inputState[field.name]}
                  onChange={onChange}
                  fullWidth
                  multiline={Boolean(field.multiline)}
                />
              } else if (field.type === 'select') {
                return <Select
                  key={field.name}
                  onChange={selected => setInputState({
                    ...inputState,
                    [field.name]: selected || []
                  })}
                  onCreateOption={newOption => setInputState({
                    ...inputState,
                    [field.name]: [
                      ...inputState[field.name],
                      field.onSelectCreate
                        ? field.onSelectCreate(newOption)
                        : { label: newOption, value: newOption }
                    ]
                  })}
                  placeholder={field.label}
                  components={{ ...field.components }}
                  options={field.values}
                  value={inputState[field.name]}
                  styles={field.styles}
                  menuPlacement='auto'
                  menuPosition='fixed'
                  defaultValue={field.defaultValue}
                  isMulti={field.isMultiSelect}
                />
              } else if (field.type === 'checkbox') {
                return <FormControl
                  style={{ verticalAlign: 'middle', marginRight: '12px' }}
                  key={field.name}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={inputState[field.name]}
                        onChange={evt =>
                          setInputState({ ...inputState, [field.name]: evt.target.checked })}
                        value={field.name}
                        color='primary'
                      />
                    }
                    label={field.name[0].toUpperCase() + field.name.substr(1)}
                  />
                </FormControl>
              }
              return null
            })
          }
        </DialogContent>
        <DialogActions>
          {
            CustomActions ?
              <CustomActions
                ctx={contextRef.current} handleSubmit={handleSubmit}
                submitDisabled={state.submitDisabled} requiredMissing={requiredMissing}
                {...state.customActionsProps}
              />
              :
              <>
                <Button onClick={closeDialog} color='primary'>
                  Cancel
                </Button>
                <Button
                  type='submit'
                  disabled={state.submitDisabled || requiredMissing}
                  color='primary'
                >
                  {state.actionText}
                </Button>
              </>
          }
        </DialogActions>
      </OptionalForm>
    </MuiDialog>
  )
}

export default Dialog
