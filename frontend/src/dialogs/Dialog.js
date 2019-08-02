import React, { useState, useContext, createContext, useRef } from 'react'
import {
  Dialog as MuiDialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button,
  TextField
} from '@material-ui/core'

import { useMessageStateValue } from '../store'

export const DialogContext = createContext({})
export const useDialog = () => useContext(DialogContext)

const blankState = () => ({
  open: false,
  submitDisabled: false,
  mutation: null,
  requiredVariables: [],
  actionText: '',
  fields: [],
  title: '',
  content: [],
  customActions: null
})

const Dialog = ({ children }) => {
  const stateChange = useRef(-1)
  const [state, setState] = useState(blankState())
  const [inputState, setInputState] = useState(null)
  const messageDispatch = useMessageStateValue()[1]

  const handleClose = () => {
    clearTimeout(stateChange.current)
    setState({ ...state, open: false })
    stateChange.current = setTimeout(() => {
      setState(blankState())
      setInputState(null)
    }, 250)
  }

  const handleSubmit = () => {
    if (state.submitDisabled) return
    const variables = Object.fromEntries(state.fields
      .map(key => [key.name, inputState[key.name].trim()]))
    for (const key of state.fields) {
      if (variables[key.name] === '' && key.required) {
        window.alert('Concept needs a name!')
        return
      }
    }
    setState({ ...state, submitDisabled: false })
    state.mutation({ variables: { ...state.requiredVariables, ...variables } })
      .catch(() => {
        messageDispatch({
          type: 'setError',
          data: 'Access denied'
        })
      })
      .finally(handleClose)
  }

  const openDialog = (
    { mutation, requiredVariables, actionText, fields, title, content, customActions }
  ) => {
    clearTimeout(stateChange.current)
    setInputState(Object.fromEntries(fields.map(key => [key.name, key.defaultValue])))
    setState({
      open: true,
      submitDisabled: false,
      mutation,
      requiredVariables,
      actionText,
      fields: fields.map(field => typeof field === 'string' ? { name: field } : field),
      title,
      content,
      customActions
    })
  }

  return <>
    <DialogContext.Provider value={{ openDialog }}>
      {children}
    </DialogContext.Provider>

    <MuiDialog open={state.open} onClose={handleClose}>
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
              value={inputState[key.name]}
              onChange={(e) => setInputState({ ...inputState, [key.name]: e.target.value })}
              fullWidth
              multiline={Boolean(key.multiline)}
            />
          )
        }
      </DialogContent>
      <DialogActions>
        {
          state.customActions || <>
            <Button onClick={handleClose} color='primary'>
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
  </>
}

export default Dialog
