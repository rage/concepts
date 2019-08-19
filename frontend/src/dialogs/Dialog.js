import React, { useState, useRef } from 'react'
import {
  Dialog as MuiDialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button,
  TextField
} from '@material-ui/core'

import { useMessageStateValue } from '../store'

const blankState = () => ({
  open: false,
  submitDisabled: false,
  mutation: null,
  requiredVariables: [],
  actionText: '',
  fields: [],
  title: '',
  content: [],
  CustomActions: null,
  customActionsProps: null,
  type: '',
  specialFields: []
})

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

  const handleSubmit = (close) => {
    if (state.submitDisabled) return
    const variables = Object.fromEntries(state.fields
      .map(key => [key.name, inputState[key.name].trim()]))
    for (const key of state.fields) {
      if (variables[key.name] === '' && key.required) {
        window.alert(`${state.type} needs a ${key.name}!`)
        return
      }
    }
    setSubmitDisabled(true)
    state.mutation({ variables: { ...state.requiredVariables, ...variables } })
      .catch(() => {
        messageDispatch({
          type: 'setError',
          data: 'Access denied'
        })
      })
      .finally(close
        ? closeDialog
        : () => setSubmitDisabled(false))
  }

  contextRef.current.setSubmitDisabled = setSubmitDisabled
  contextRef.current.closeDialog = closeDialog

  contextRef.current.openDialog = ({
    mutation, requiredVariables, actionText, fields, title, content, CustomActions,
    customActionsProps, type, specialFields
  }) => {
    clearTimeout(stateChange.current)
    if (fields) {
      setInputState(Object.fromEntries(fields.map(key => [key.name, key.defaultValue || ''])))
    }
    setState({
      open: true,
      submitDisabled: false,
      mutation,
      requiredVariables,
      actionText,
      fields: fields
        ? fields.map(field => typeof field === 'string' ? { name: field } : field)
        : [],
      title,
      content: content || [],
      CustomActions,
      customActionsProps,
      type,
      specialFields
    })
  }

  contextRef.current.updateDialog = ({ ...data }) => {
    setState({
      ...state,
      ...data
    })
  }

  const { CustomActions } = state
  return (
    <MuiDialog open={state.open} onClose={closeDialog}>
      <DialogTitle>{state.title}</DialogTitle>
      <DialogContent>
        {
          state.content.map((contentText, i) =>
            <DialogContentText key={i}>
              {contentText}
            </DialogContentText>
          )
        }
        {
          state.fields.map((key, index) =>
            <TextField
              key={key.name}
              autoFocus={index === 0}
              variant='outlined'
              margin='dense'
              id={key.name}
              label={key.name[0].toUpperCase() + key.name.substr(1)}
              type='text'
              rows={2}
              rowsMax={10}
              value={inputState[key.name]}
              onChange={(e) => setInputState({ ...inputState, [key.name]: e.target.value })}
              fullWidth
              multiline={Boolean(key.multiline)}
            />
          )
        }
        {
          state.specialFields && state.specialFields.map(CustomField =>
            <CustomField />
          )
        }
      </DialogContent>
      <DialogActions>
        {
          CustomActions ?
            <CustomActions
              closeDialog={closeDialog} handleSubmit={handleSubmit}
              submitDisabled={state.submitDisabled} {...state.customActionsProps}
            />
            :
            <>
              <Button onClick={closeDialog} color='primary'>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={state.submitDisabled}
                color='primary'
              >
                {state.actionText}
              </Button>
            </>
        }
      </DialogActions>
    </MuiDialog>
  )
}

export default Dialog
