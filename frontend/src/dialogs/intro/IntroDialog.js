import React, { useState } from 'react'
import {
  Dialog as MuiDialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, FormControlLabel, Button, Checkbox, FormControl
} from '@material-ui/core'
import { useApolloClient } from 'react-apollo-hooks'

import { useLoginStateValue } from '../../lib/store'
import introContent from '../../static/introContent'
import { UPDATE_SEEN_GUIDES } from '../../graphql/Mutation'

const mapObject = (obj, func) => Object.fromEntries(Object.entries(obj)
  .map(([k, v], ...args) => [k, func(v, ...args)]))

introContent.originalViews = introContent.views
introContent.viewMaps = mapObject(introContent.views,
  view => Object.fromEntries(view.map(item => [item.id, item])))

const blankState = () => ({
  open: false,
  currentView: null,
  currentGuide: null
})

const IntroDialogContent = ({ currentCardContent }) => <>
  <DialogTitle>{currentCardContent.title}</DialogTitle>
  <DialogContent style={{ display: 'flex', flexDirection: 'column' }}>
    <DialogContentText>
      {currentCardContent.description} <br />
      You can view the video below, or go through the user guide yourself by clicking the ?⃝ button
      in the bottom right corner.
    </DialogContentText>
    {currentCardContent.video &&
      <video
        key={currentCardContent.id} controls muted
        style={{ width: '100%', height: 'calc(100% - 64px)', overflow: 'hidden' }}
      >
        <source src={currentCardContent.video} type='video/webm' />
      </video>
    }
  </DialogContent>
</>

const IntroDialog = ({ contextRef }) => {
  const [state, setState] = useState(blankState())
  const [inputState, setInputState] = useState({
    noShowAgain: false
  })
  const [{ user }, dispatch] = useLoginStateValue()
  const client = useApolloClient()

  const currentCardContent = introContent.viewMaps && state.currentView && state.currentGuide ?
    introContent.viewMaps[state.currentView][state.currentGuide] : null

  const closeDialog = () => {
    // Other cleanup
    saveViewed(inputState.noShowAgain)
    setState({ open: false })
    setInputState({ noShowAgain: false })
  }

  const saveViewed = async (noShow) => {
    let response
    if (noShow) {
      const currentUser = JSON.parse(window.localStorage.currentUser)
      try {
        response = await client.mutate({
          mutation: UPDATE_SEEN_GUIDES,
          variables: {
            id: user.id, seenGuides: [
              ...currentUser.user.seenGuides,
              `${state.currentView}.${state.currentGuide}`
            ]
          }
        })
      } catch {}
    }
    if (state.currentView && state.currentGuide) {
      dispatch({
        type: 'guideSeen',
        data: {
          guide: `${state.currentView}.${state.currentGuide}`,
          newSeenGuides: response?.data?.updateSeenGuides?.seenGuides
        }
      })
    }
  }

  contextRef.current.closeDialog = closeDialog

  contextRef.current.openDialog = (currentView, currentGuide) => {
    // Other state changes
    const array = currentView.split('/')
    let trimmedCurrView = array[array.length - 1]
    trimmedCurrView = trimmedCurrView.slice(0, -1)

    const hasSeenGuide = user?.seenGuides?.find(intro => {
      const [view, guide] = intro.split('.')
      return view === trimmedCurrView && guide === currentGuide
    })
    const viewHasGuide = Boolean(introContent.viewMaps?.[trimmedCurrView]?.[currentGuide])
    if (!hasSeenGuide && viewHasGuide) {
      setState({
        ...state,
        open: viewHasGuide,
        currentView: trimmedCurrView,
        currentGuide
      })
    }
  }

  return (
    <MuiDialog maxWidth='xl' open={state.open} onClose={closeDialog}>
      {currentCardContent && <IntroDialogContent currentCardContent={currentCardContent} />}
      <DialogActions>
        <div>
          <FormControl
            style={{ verticalAlign: 'middle', marginRight: '12px' }}
            key='Do not show again'
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={inputState.noShowAgain}
                  onChange={evt => setInputState({
                    ...inputState,
                    noShowAgain: evt.target.checked
                  })}
                  value='Do not show again'
                  color='primary'
                />
              }
              label='Do not show again'
            />
          </FormControl>
          <Button onClick={closeDialog} color='primary'>
          Close
          </Button>
        </div>
      </DialogActions>
    </MuiDialog>
  )
}

export default IntroDialog
