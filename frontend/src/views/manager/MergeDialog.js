import React, { useLayoutEffect, useRef, useState } from 'react'
import { useMutation, useQuery } from 'react-apollo-hooks'
import {
  TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText
} from '@material-ui/core'
import Select from 'react-select/creatable'

import { MERGE_CONCEPTS } from '../../graphql/Mutation'
import { WORKSPACE_BY_ID } from '../../graphql/Query'

const MergeDialogContent = ({ state, setState, concepts, contentWidth }) => {
  switch (state.step) {
  case 0: // Name
    return <>
      <DialogContentText>Choose name for the merged concept</DialogContentText>
      <Select
        onChange={({ value }) => setState({ ...state, name: value })}
        options={concepts.map(concept => ({ value: concept.name, label: concept.name }))}
        value={state.name ? { value: state.name, label: state.name } : undefined}
        id='merge-dialog-name'
        styles={{
          menu: styles => ({
            ...styles,
            position: 'fixed',
            width: contentWidth,
            top: 'unset'
          })
        }}
      />
    </>
  case 1: // Description
    return <>
      <DialogContentText>Write description for the merged concept</DialogContentText>
      <TextField
        autoFocus variant='outlined' margin='dense' type='text' label='Description'
        rows={2} rowsMax={10} value={state.description} fullWidth multiline
        onChange={evt => setState({ ...state, description: evt.target.value })}
      />
    </>

  case 2: // Tags
    return <>
      <DialogContentText>Choose tags for the merged concept</DialogContentText>
      <DialogContentText>TODO</DialogContentText>
    </>
  default:
    throw new Error('Invalid step')
  }
}

const stepField = ['name', 'description', 'tags']

const MergeDialog = ({ workspaceId, courseId, conceptIds, close }) => {
  const contentRef = useRef(null)
  const [contentWidth, setContentWidth] = useState('720px')
  const [state, setState] = useState({
    step: 0,
    name: null,
    description: '',
    official: false,
    tags: []
  })

  useLayoutEffect(() => {
    if (contentRef.current) {
      const style = getComputedStyle(contentRef.current)
      const w = parseInt(style.width) - parseInt(style.paddingRight) - parseInt(style.paddingLeft)
      setContentWidth(`${w}px`)
    }
  }, [contentRef.current])

  const workspaceQuery = useQuery(WORKSPACE_BY_ID, {
    variables: {
      id: workspaceId
    }
  })

  const doMerge = useMutation(MERGE_CONCEPTS, {
    refetchQueries: [{
      query: WORKSPACE_BY_ID,
      variables: {
        id: workspaceId
      }
    }]
  })

  const back = () => {
    setState({ ...state, step: state.step - 1 })
  }

  const submit = evt => {
    evt.preventDefault()
    if (state.step < 2) {
      setState({ ...state, step: state.step + 1 })
    } else {
      doMerge({
        variables: {
          workspaceId,
          courseId,
          conceptIds: Array.from(conceptIds),
          ...state
        }
      }).then(close)
    }
  }

  const concepts = workspaceQuery.data.workspaceById && workspaceQuery.data.workspaceById
    .courses.flatMap(course => course.concepts)
    .filter(concept => conceptIds.has(concept.id))

  return (
    <Dialog open={true} fullWidth={true} maxWidth='sm'>
      <DialogTitle>Merge concepts</DialogTitle>
      <form onSubmit={submit}>
        <DialogContent ref={contentRef}>
          <MergeDialogContent
            state={state} setState={setState} concepts={concepts} contentWidth={contentWidth}
          />
        </DialogContent>
        <DialogActions>
          <Button disabled={state.step <= 0} onClick={back} color='primary'>Back</Button>

          <div style={{ flex: '1 0 0' }} />

          <Button onClick={close} color='primary'>Cancel</Button>
          <Button
            type='submit' color='primary'
            disabled={state.step < 2 ? state[stepField[state.step]] === null : state.submitDisabled}
          >
            {state.step < 2 ? 'Next' : 'Merge'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default MergeDialog
