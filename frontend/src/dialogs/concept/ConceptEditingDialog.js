import React, { useState, useEffect } from 'react'
import {
  Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField
} from '@material-ui/core'

import { useMessageStateValue } from '../../store'

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

  const messageDispatch = useMessageStateValue()[1]

  useEffect(() => {
    if (state.open) {
      setSubmitDisabled(false)
    }
    setName(defaultName)
    setDescription(defaultDescription)
  }, [defaultDescription, defaultName, state])

  const handleConceptUpdate = () => {
    if (submitDisabled) return
    const conceptName = name.trim()
    const conceptDescription = description.trim()
    if (conceptName === '') {
      window.alert('Concept needs a name!')
      return
    }
    setSubmitDisabled(true)
    const variables = { id: state.conceptId }
    let shouldUpdate = false
    if (defaultName !== name) {
      variables.name = conceptName
      shouldUpdate = true
    }
    if (defaultDescription !== conceptDescription) {
      variables.description = conceptDescription
      shouldUpdate = true
    }
    if (shouldUpdate) {
      updateConcept({
        variables
      })
        .catch(() => {
          messageDispatch({
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
          onClick={handleConceptUpdate}
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
