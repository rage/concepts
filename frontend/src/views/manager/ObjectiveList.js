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
import ObjectiveEditor from './ObjectiveEditor'
import ObjectiveListItem from './ObjectiveListItem'
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

const ObjectiveList = ({
  workspace, course, updateCourse, createObjective, updateObjective, deleteObjective
}) => {
  const classes = useStyles()
  const infoBox = useInfoBox()
  const [{ user }] = useLoginStateValue()
  const listRef = useRef()
  const [editing, setEditing] = useState(null)
  const [merging, setMerging] = useState(null)
  const mergeDialogTimeout = useRef(-1)
  const [mergeDialogOpen, setMergeDialogOpen] = useState(null)
  const [objectiveFilter, setObjectiveFilter] = useState('')

  const isOrdered = course.objectiveOrder.length === 1
    && course.objectiveOrder[0].startsWith('__ORDER_BY__')
  const defaultOrderMethod = isOrdered ? course.objectiveOrder[0].substr('__ORDER_BY__'.length)
    : 'CUSTOM'
  const [orderedObjectives, setOrderedObjectives] = useState([])
  const [orderMethod, setOrderMethod] = useState(defaultOrderMethod)
  const [dirtyOrder, setDirtyOrder] = useState(null)

  useEffect(() => {
    if (!dirtyOrder && defaultOrderMethod !== orderMethod) {
      setOrderMethod(defaultOrderMethod)
    }
    if (!dirtyOrder || orderMethod !== 'CUSTOM') {
      setOrderedObjectives(sortedConcepts(course.objectives, course.objectiveOrder, orderMethod))
    }
  }, [course.objectives, course.objectiveOrder, dirtyOrder, defaultOrderMethod, orderMethod])

  const onSortEnd = ({ oldIndex, newIndex }) =>
    ReactDOM.unstable_batchedUpdates(() => {
      setOrderedObjectives(items => arrayShift(items, oldIndex, newIndex))
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
      objectiveOrder: orderMethod === 'CUSTOM'
        ? orderedObjectives.map(objective => objective.id)
        : [`__ORDER_BY__${orderMethod}`]
    })
    setDirtyOrder(null)
  }

  const isTemplate = Boolean(workspace.asTemplate ?.id)
  const objectiveTags = backendToSelect(workspace.objectiveTags)

  const startMerging = () => {
    setEditing(null)
    setMerging(new Set())
  }
  const toggleMergingObjective = id => {
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
            bRef={infoBox.ref('manager', 'FINISH_MERGE')}
            onClick={openMergeDialog} disabled={merging.size < 2}
          >
            Merge…
          </CardHeaderButton>
          <CardHeaderButton
            bRef={infoBox.secondaryRef('manager', 'FINISH_MERGE')} onClick={stopMerging}
          >
            Cancel
          </CardHeaderButton>
        </>
      }
      return (
        <CardHeaderButton
          bRef={infoBox.ref('manager', 'START_MERGE')} onClick={startMerging}
          disabled={course.objectives.length < 2}
        >
          Start merge
        </CardHeaderButton>
      )
    }
    return null
  }

  const objectiveFilterParsed = parseFilter(objectiveFilter)
  const includeObjective = objective => intIncludeConcept(objective, objectiveFilterParsed)

  return (
    <Card elevation={0} className={classes.root}>
      <CardHeader
        classes={{ title: classes.header, content: classes.headerContent }}
        title={`Objectives of ${course.name}`}
        action={cardHeaderActions()}
      />

      <div className={classes.filterBar}>
        <TextField
          variant='outlined'
          margin='dense'
          label='Filter objectives'
          ref={infoBox.ref('manager', 'FILTER_OBJECTIVES')}
          value={objectiveFilter}
          onChange={evt => setObjectiveFilter(evt.target.value)}
          className={classes.filterText}
        />
        <TextField
          select
          variant='outlined'
          margin='dense'
          label='Sort by'
          ref={infoBox.ref('manager', 'SORT_OBJECTIVES')}
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
        workspace={workspace} courseId={course.id} objectiveIds={merging} close={closeMergeDialog}
        open={mergeDialogOpen.open}
      />}
      <SortableList
        ref={listRef} className={classes.list} useDragHandle lockAxis='y' onSortEnd={onSortEnd}
      >
        {orderMethod !== 'GROUP_BY' ? orderedObjectives.map((objective, objectiveIndex) =>
          includeObjective(objective) &&
          <ObjectiveListItem
            key={objective.id}
            objective={objective}
            user={user}
            editing={editing}
            index={objectiveIndex}
            deleteObjective={deleteObjective}
            updateObjective={updateObjective}
            merging={merging}
            setEditing={setEditing}
            sortable={orderMethod === 'CUSTOM' && !course.frozen}
            toggleMergingObjective={toggleMergingObjective}
            checkboxRef={objectiveIndex === 0 ? infoBox.ref('manager', 'SELECT_MERGE_OBJECTIVES')
              : objectiveIndex === 1 ? infoBox.secondaryRef('manager', 'SELECT_MERGE_OBJECTIVES')
                : undefined}
            objectiveTags={objectiveTags}
          />
        ) : groupConcepts(course.objectives).flatMap((group, index, array) => {
          const elements = group.filter(objective => includeObjective(objective))
            .map((objective, objectiveIndex) =>
              <ObjectiveListItem
                key={objective.id}
                objective={objective}
                user={user}
                editing={editing}
                deleteObjective={deleteObjective}
                updateObjective={updateObjective}
                merging={merging}
                setEditing={setEditing}
                toggleMergingObjective={toggleMergingObjective}
                divider={false}
                checkboxRef={objectiveIndex === 0 ? infoBox.ref('manager', 'SELECT_MERGE_OBJECTIVES')
                  : objectiveIndex === 1 ? infoBox.secondaryRef('manager', 'SELECT_MERGE_OBJECTIVES')
                    : undefined}
                sortable={false}
                objectiveTags={objectiveTags}
              />
            )
          if (elements.length !== 0 && index < array.length - 1) {
            elements.push([<hr key={index} />])
          }
          return elements
        }
        )
        }</SortableList>
      <ObjectiveEditor submit={async args => {
        await createObjective(args)
        listRef.current.scrollTop = listRef.current.scrollHeight
        infoBox.redrawIfOpen('manager',
          'CREATE_OBJECTIVE_NAME', 'CREATE_OBJECTIVE_DESCRIPTION', 'CREATE_OBJECTIVE_TAGS',
          'CREATE_OBJECTIVE_SUBMIT')
      }} defaultValues={{ official: isTemplate }} tagOptions={objectiveTags} />
    </Card>
  )
}

export default ObjectiveList
