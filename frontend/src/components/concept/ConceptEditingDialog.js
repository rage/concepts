import React, { useState, useEffect } from 'react'

//  dialog
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'

// Materal common
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'

// Error dispatcher
import { useErrorStateValue } from '../../store'

const ConceptEditingDialog = ({
  state,
  handleClose,
  updateConcept,
  defaultName,
  defaultDescription
}) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [submitDisabled, setSubmitDisabled] = useState(false)

  const errorDispatch = useErrorStateValue()[1]

  useEffect(() => {
    if (state.open) {
      setSubmitDisabled(false)
    }
    setName(defaultName)
    setDescription(defaultDescription)
  }, [defaultDescription, defaultName, state])

  const handleConceptUpdate = () => {
    if (name === '') {
      window.alert('Concept needs a name!')
      return
    }
    setSubmitDisabled(true)
    const variables = { id: state.conceptId }
    let shouldUpdate = false
    if (defaultName !== name) {
      variables.name = name
      shouldUpdate = true
    }
    if (defaultDescription !== description) {
      variables.description = description
      shouldUpdate = true
    }
    if (shouldUpdate) {
      updateConcept({
        variables
      })
        .catch(() => {
          errorDispatch({
            type: 'setError',
            data: 'Access denied'
          })
        })
        .finally(handleClose)
    } else {
      handleClose()
    }
  }


  return (
    <Dialog
      open={state.open}
      onClose={handleClose}
      aria-labelledby='form-dialog-title'
    >
      <DialogTitle id='form-dialog-title'>
        Edit concept
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin='dense'
          id='name'
          label='Name'
          type='text'
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />

        <TextField
          multiline
          margin='dense'
          id='description'
          label='Description'
          type='text'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          variant='outlined'
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color='primary'>
          Cancel
        </Button>
        <Button
          onClick={!submitDisabled ? handleConceptUpdate : () => null}
          disabled={submitDisabled}
          color='primary'
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConceptEditingDialog
