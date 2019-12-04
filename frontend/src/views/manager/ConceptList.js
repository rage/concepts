import React, { useState, useRef, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Button, TextField, Card, CardHeader, MenuItem, CircularProgress } from '@material-ui/core'
import ReactDOM from 'react-dom'

import { Role } from '../../lib/permissions'
import { useLoginStateValue } from '../../lib/store'
import { SortableList } from '../../lib/sortableMoc'
import { backendToSelect } from '../../dialogs/tagSelectUtils'
import { useInfoBox } from '../../components/InfoBox'
import groupConcepts from './groupConcepts'
import MergeDialog from './MergeDialog'
import ItemEditor from './ItemEditor'
import ConceptListItem from './ConceptListItem'
import arrayShift from '../../lib/arrayShift'
import { sortedConcepts } from '../../lib/ordering'
import { parseFilter, includeConcept as intIncludeConcept } from './search'

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

const ItemList = ({
  workspace, course, updateCourse, createConcept, updateConcept, deleteConcept, level
}) => {
  const managerRef = 'manager'
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

  useEffect(() => {
    if (!dirtyOrder && defaultOrderMethod !== orderMethod) {
      setOrderMethod(defaultOrderMethod)
    }
    if (!dirtyOrder || orderMethod !== 'CUSTOM') {
      setOrderedConcepts(sortedConcepts(course.concepts, course.conceptOrder, orderMethod))
    }
  }, [course.concepts, course.conceptOrder, dirtyOrder, defaultOrderMethod, orderMethod])

  const onSortEnd = ({ oldIndex, newIndex }) =>
    ReactDOM.unstable_batchedUpdates(() => {
      setOrderedConcepts(items => arrayShift(items, oldIndex, newIndex))
      if (!dirtyOrder) setDirtyOrder('yes')
      if (orderMethod !== 'CUSTOM') setOrderMethod('CUSTOM')
    })

  const resetOrder = () => {
    setDirtyOrder(null)
    setOrderMethod(defaultOrderMethod)
  }

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

  const isTemplate = Boolean(workspace.asTemplate ?.id)
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

  const CardHeaderButton = ({ children, bRef, color = 'primary', onClick, disabled = false }) => (
    <Button
      style={{ margin: '6px' }} ref={bRef} color={color} onClick={!disabled ? onClick : () => { }}
      disabled={disabled}
    >
      {children}
    </Button>
  )

  const cardHeaderActions = () => {
    if (dirtyOrder) {
      return <>
        <CardHeaderButton
          color='secondary' onClick={resetOrder} disabled={dirtyOrder === 'loading'}
        >
          Reset
        </CardHeaderButton>
        <CardHeaderButton onClick={saveOrder} disabled={dirtyOrder === 'loading'}>
          {dirtyOrder === 'loading' ? <CircularProgress /> : 'Save'}
        </CardHeaderButton>
      </>
    } else if (user.role >= Role.STAFF) {
      if (merging) {
        return <>
          <CardHeaderButton
            bRef={infoBox.ref(managerRef, 'FINISH_MERGE')}
            onClick={openMergeDialog} disabled={merging.size < 2}
          >
            Merge…
          </CardHeaderButton>
          <CardHeaderButton
            bRef={infoBox.secondaryRef(managerRef, 'FINISH_MERGE')} onClick={stopMerging}
          >
            Cancel
          </CardHeaderButton>
        </>
      }
      return (
        <CardHeaderButton
          bRef={infoBox.ref(managerRef, 'START_MERGE')} onClick={startMerging}
          disabled={course.concepts.length < 2}
        >
          Start merge
        </CardHeaderButton>
      )
    }
    return null
  }

  const conceptFilterParsed = parseFilter(conceptFilter)
  const includeConcept = concept => intIncludeConcept(concept, conceptFilterParsed)

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
          label={`Filter ${level.toLowerCase()}s`}
          ref={infoBox.ref(managerRef, 'FILTER_CONCEPTS')}
          value={conceptFilter}
          onChange={evt => setConceptFilter(evt.target.value)}
          className={classes.filterText}
        />
        <TextField
          select
          variant='outlined'
          margin='dense'
          label='Sort by'
          ref={infoBox.ref(managerRef, 'SORT_CONCEPTS')}
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
      />}
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
            sortable={orderMethod === 'CUSTOM' && !course.frozen}
            toggleMergingConcept={toggleMergingConcept}
            checkboxRef={conceptIndex === 0 ? infoBox.ref(managerRef, 'SELECT_MERGE_CONCEPTS')
              : conceptIndex === 1 ? infoBox.secondaryRef(managerRef, 'SELECT_MERGE_CONCEPTS')
                : undefined}
            conceptTags={conceptTags}
          />
        ) : groupConcepts(course.concepts).flatMap((group, index, array) => {
          const elements = group.filter(concept => includeConcept(concept))
            .map((concept, conceptIndex) =>
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
                checkboxRef={conceptIndex === 0 ? infoBox.ref(managerRef, 'SELECT_MERGE_CONCEPTS')
                  : conceptIndex === 1 ? infoBox.secondaryRef(managerRef, 'SELECT_MERGE_CONCEPTS')
                    : undefined}
                sortable={false}
                conceptTags={conceptTags}
              />
            )
          if (elements.length !== 0 && index < array.length - 1) {
            elements.push([<hr key={index} />])
          }
          return elements
        }
        )
        }</SortableList>
      <ItemEditor submit={async args => {
        await createConcept(args)
        listRef.current.scrollTop = listRef.current.scrollHeight
        infoBox.redrawIfOpen(managerRef,
          'CREATE_CONCEPT_NAME', 
          'CREATE_CONCEPT_DESCRIPTION', 
          'CREATE_CONCEPT_TAGS',
          'CREATE_CONCEPT_SUBMIT')
        }} 
        action='Create'
        defaultValues={{ official: isTemplate, level }} 
        tagOptions={conceptTags} 
      />
    </Card>
  )
}

export default ItemList
