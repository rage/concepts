import React, { useState, useRef, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {Button, TextField, Card, CardHeader, MenuItem, CircularProgress} from '@material-ui/core'
import ReactDOM from 'react-dom'

import { Role } from '../../lib/permissions'
import { useLoginStateValue } from '../../lib/store'
import { SortableList } from '../../lib/sortableMoc'
import { backendToSelect } from '../../dialogs/tagSelectUtils'
import { useInfoBox } from '../../components/InfoBox'
import groupConcepts from './ConceptGroup'
import MergeDialog from './MergeDialog'
import ConceptEditor from './ConceptEditor'
import ConceptListItem from './ConceptListItem'
import arrayShift from '../../lib/arrayShift'

const useStyles = makeStyles(theme => ({
  root: {
    ...theme.mixins.gutters(), width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column'
  },
  headerContent: {
    minWidth: 0
  },
  header: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  },
  filterBar: {
    display: 'flex',
    marginBottom: '8px'
  },
  filterText: {
    flex: 1,
    marginRight: '8px'
  },
  list: {
    overflow: 'auto'
  }
}))

const sortingOptions = {
  ALPHA_ASC: 'Alphabetical (A-Z)',
  ALPHA_DESC: 'Alphabetical (Z-A)',
  CREATION_ASC: 'Creation date (oldest first)',
  CREATION_DESC: 'Creation date (newest first)',
  GROUP_BY: 'Group by name',
  CUSTOM: 'Custom'
}

const ConceptList = ({
  workspace, course, updateCourse, createConcept, updateConcept, deleteConcept
}) => {
  const classes = useStyles()
  const infoBox = useInfoBox()
  const [{ user }] = useLoginStateValue()
  const listRef = useRef()
  const [editing, setEditing] = useState(null)
  const [merging, setMerging] = useState(null)
  const mergeDialogTimeout = useRef(-1)
  const [mergeDialogOpen, setMergeDialogOpen] = useState(null)
  const [conceptFilter, setConceptFilter] = useState('')

  const isOrdered = course.conceptOrder.length === 1
    && course.conceptOrder[0].startsWith('__ORDER_BY__')
  const defaultOrderMethod = isOrdered ? course.conceptOrder[0].substr('__ORDER_BY__'.length)
    : 'CUSTOM'
  const [orderedConcepts, setOrderedConcepts] = useState([])
  const [orderMethod, setOrderMethod] = useState(defaultOrderMethod)
  const [dirtyOrder, setDirtyOrder] = useState(null)

  const sort = (concepts, method, order) => {
    switch (method) {
    case 'CUSTOM':
      return order
        .map(orderedId => {
          const index = concepts.findIndex(concept => concept.id === orderedId)
          return index >= 0 ? concepts.splice(index, 1)[0] : null
        })
        .filter(concept => concept !== null)
        .concat(concepts)
    case 'ALPHA_ASC':
      return concepts.sort((a, b) => a.name.localeCompare(b.name, 'fi'))
    case 'ALPHA_DESC':
      return concepts.sort((a, b) => b.name.localeCompare(a.name, 'fi'))
    case 'CREATION_ASC':
      return concepts
    case 'CREATION_DESC':
      return concepts.reverse()
    default:
      return concepts
    }
  }

  useEffect(() => {
    if (!dirtyOrder || orderMethod !== 'CUSTOM') {
      setOrderedConcepts(sort(course.concepts.slice(), orderMethod, course.conceptOrder))
    }
  }, [course.concepts, course.conceptOrder, dirtyOrder, orderMethod])

  const onSortEnd = ({ oldIndex, newIndex }) =>
    ReactDOM.unstable_batchedUpdates(() => {
      setOrderedConcepts(items => arrayShift(items, oldIndex, newIndex))
      if (!dirtyOrder) setDirtyOrder('yes')
      if (orderMethod !== 'CUSTOM') setOrderMethod('CUSTOM')
    })

  const resetOrder = () =>
    ReactDOM.unstable_batchedUpdates(() => {
      setDirtyOrder(null)
      setOrderMethod(defaultOrderMethod)
    })

  const saveOrder = async () => {
    setDirtyOrder('loading')
    await updateCourse({
      id: course.id,
      conceptOrder: orderMethod === 'CUSTOM'
        ? orderedConcepts.map(concept => concept.id)
        : [`__ORDER_BY__${orderMethod}`]
    })
    setDirtyOrder(null)
  }

  const isTemplate = Boolean(workspace.asTemplate?.id)
  const conceptTags = backendToSelect(workspace.conceptTags)

  const startMerging = () => {
    setEditing(null)
    setMerging(new Set())
  }
  const toggleMergingConcept = id => {
    const copy = new Set(merging)
    if (copy.has(id)) {
      copy.delete(id)
    } else {
      copy.add(id)
    }
    setMerging(copy)
  }

  const stopMerging = () => setMerging(null)
  const openMergeDialog = () => {
    clearTimeout(mergeDialogTimeout.current)
    setMergeDialogOpen({ open: true })
  }
  const closeMergeDialog = () => {
    setMergeDialogOpen({ open: false })
    mergeDialogTimeout.current = setTimeout(() => setMergeDialogOpen(null), 500)
  }

  useEffect(() => () => {
    setEditing(null)
    stopMerging()
    closeMergeDialog()
  }, [course])

  const cardHeaderButton = (text, ref, onClick, disabled = false) => (
    <Button
      key={text}
      style={{ margin: '6px' }}
      ref={ref}
      variant='outlined' color='primary'
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
    >
      {text}
    </Button>
  )

  const cardHeaderActions = () => {
    if (dirtyOrder) {
      return <>
        <Button
          style={{ margin: '6px' }} color='secondary' onClick={resetOrder}
          disabled={dirtyOrder === 'loading'}
        >
          Reset
        </Button>
        <Button
          style={{ margin: '6px' }} color='primary' onClick={saveOrder}
          disabled={dirtyOrder === 'loading'}
        >
          {dirtyOrder === 'loading' ? <CircularProgress /> : 'Save'}
        </Button>
      </>
    } else if (user.role >= Role.STAFF) {
      if (merging) {
        return [
          cardHeaderButton('Merge…', infoBox.ref('manager', 'FINISH_MERGE'),
            () => openMergeDialog(), merging.size < 2),
          cardHeaderButton('Cancel', infoBox.secondaryRef('manager', 'FINISH_MERGE'),
            () => stopMerging())
        ]
      }
      return cardHeaderButton('Start merge', infoBox.ref('manager', 'START_MERGE'),
        () => startMerging(), course.concepts.length < 2)
    }
    return null
  }

  const conceptFilterLowerCase = conceptFilter.toLowerCase()
  const includeConcept = concept => conceptFilter.length === 0
    || concept.name.toLowerCase().includes(conceptFilterLowerCase)

  return (
    <Card elevation={0} className={classes.root}>
      <CardHeader
        classes={{ title: classes.header, content: classes.headerContent }}
        title={`Concepts of ${course.name}`}
        action={cardHeaderActions()}
      />

      <div className={classes.filterBar}>
        <TextField
          variant='outlined'
          margin='dense'
          label='Filter concepts'
          ref={infoBox.ref('manager', 'FILTER_CONCEPTS')}
          value={conceptFilter}
          onChange={evt => setConceptFilter(evt.target.value)}
          className={classes.filterText}
        />
        <TextField
          select
          variant='outlined'
          margin='dense'
          label='Sort by'
          ref={infoBox.ref('manager', 'SORT_CONCEPTS')}
          value={orderMethod}
          onChange={evt => {
            setOrderMethod(evt.target.value)
            setDirtyOrder(true)
          }}
        >
          {Object.entries(sortingOptions).map(([key, label]) =>
            <MenuItem key={key} value={key}>{label}</MenuItem>
          )}
        </TextField>
      </div>

      {mergeDialogOpen !== null && <MergeDialog
        workspace={workspace} courseId={course.id} conceptIds={merging} close={closeMergeDialog}
        open={mergeDialogOpen.open}
      /> }
      <SortableList
        ref={listRef} className={classes.list} useDragHandle lockAxis='y' onSortEnd={onSortEnd}
      >
        {orderMethod !== 'GROUP_BY' ? orderedConcepts.map((concept, conceptIndex) =>
          includeConcept(concept) &&
          <ConceptListItem
            key={concept.id}
            concept={concept}
            user={user}
            editing={editing}
            index={conceptIndex}
            deleteConcept={deleteConcept}
            updateConcept={updateConcept}
            merging={merging}
            setEditing={setEditing}
            toggleMergingConcept={toggleMergingConcept}
            checkboxRef={conceptIndex === 0 ? infoBox.ref('manager', 'SELECT_MERGE_CONCEPTS')
              : conceptIndex === 1 ? infoBox.secondaryRef('manager', 'SELECT_MERGE_CONCEPTS')
                : undefined}
            conceptTags={conceptTags}
          />
        ) : groupConcepts(course.concepts).flatMap((group, index, array) =>
          group.map((concept, conceptIndex) => includeConcept(concept) &&
            <ConceptListItem
              key={concept.id}
              concept={concept}
              user={user}
              editing={editing}
              deleteConcept={deleteConcept}
              updateConcept={updateConcept}
              merging={merging}
              setEditing={setEditing}
              toggleMergingConcept={toggleMergingConcept}
              divider={false}
              checkboxRef={conceptIndex === 0 ? infoBox.ref('manager', 'SELECT_MERGE_CONCEPTS')
                : conceptIndex === 1 ? infoBox.secondaryRef('manager', 'SELECT_MERGE_CONCEPTS')
                  : undefined}
              conceptTags={conceptTags}
            />
          ).concat(index < array.length - 1 ? [<hr key={index} />] : [])
        )
        }</SortableList>
      <ConceptEditor submit={async args => {
        await createConcept(args)
        listRef.current.scrollTop = listRef.current.scrollHeight
        infoBox.redrawIfOpen('manager',
          'CREATE_CONCEPT_NAME', 'CREATE_CONCEPT_DESCRIPTION', 'CREATE_CONCEPT_TAGS',
          'CREATE_CONCEPT_SUBMIT')
      }} defaultValues={{ official: isTemplate }} tagOptions={conceptTags} />
    </Card>
  )
}

export default ConceptList
