import React, { useState, useRef, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Button, TextField, Card, CardHeader, MenuItem, CircularProgress, Typography
} from '@material-ui/core'
import ReactDOM from 'react-dom'

import { Role } from '../../lib/permissions'
import { useLoginStateValue } from '../../lib/store'
import { SortableList } from '../../lib/sortableMoc'
import { backendToSelect } from '../../dialogs/tagSelectUtils'
import { useInfoBox } from '../../components/InfoBox'
import groupConcepts from './groupConcepts'
import MergeDialog from './MergeDialog'
import ConceptEditor from './ConceptEditor'
import ConceptListItem from './ConceptListItem'
import arrayShift from '../../lib/arrayShift'
import { sortedConcepts } from '../../lib/ordering'
import { parseFilter, includeConcept as intIncludeConcept } from './search'

const useStyles = makeStyles(theme => ({
  root: {
    ...theme.mixins.gutters(),
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '0 0 4px 4px'
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
    flex: 1
  },
  sortSelect: {
    marginLeft: '8px'
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

const CardHeaderButton = React.forwardRef(({
  children, color = 'primary', onClick, disabled = false
}, ref) => (
  <Button
    style={{ margin: '6px' }} ref={ref} color={color} onClick={!disabled ? onClick : () => { }}
    disabled={disabled}
  >
    {children}
  </Button>
))

const nameMap = {
  CONCEPT: 'Concepts',
  OBJECTIVE: 'Objectives',
  COMMON: 'Common concepts'
}

const ConceptList = ({
  workspace, course, updateCourse, createConcept,
  createConceptFromCommon, updateConcept, deleteConcept,
  level, sortable
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

  const orderName = `${level.toLowerCase()}Order`
  const conceptOrder = course[orderName]
  const isOrdered = conceptOrder?.length === 1 && conceptOrder[0].startsWith('__ORDER_BY__')
  const defaultOrderMethod = isOrdered ? conceptOrder[0].substr('__ORDER_BY__'.length) : 'CUSTOM'
  const [orderedConcepts, setOrderedConcepts] = useState([])
  const [orderMethod, setOrderMethod] = useState(defaultOrderMethod)
  const [dirtyOrder, setDirtyOrder] = useState(null)

  useEffect(() => {
    if (!sortable) return
    if (!dirtyOrder && defaultOrderMethod !== orderMethod) {
      setOrderMethod(defaultOrderMethod)
    }
    if (!dirtyOrder || orderMethod !== 'CUSTOM') {
      setOrderedConcepts(sortedConcepts(course.concepts.filter(concept => concept.level === level),
        conceptOrder, orderMethod))
    }
  }, [course.concepts, conceptOrder, dirtyOrder, defaultOrderMethod, orderMethod, level, sortable])

  const onSortEnd = ({ oldIndex, newIndex }) =>
    oldIndex !== newIndex && ReactDOM.unstable_batchedUpdates(() => {
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
      [orderName]: orderMethod === 'CUSTOM'
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
            ref={infoBox.ref('manager', 'FINISH_MERGE')}
            onClick={openMergeDialog} disabled={merging.size < 2}
          >
            Merge…
          </CardHeaderButton>
          <CardHeaderButton
            ref={infoBox.secondaryRef('manager', 'FINISH_MERGE')} onClick={stopMerging}
          >
            Cancel
          </CardHeaderButton>
        </>
      } else if (level !== 'COMMON') {
        return (
          <CardHeaderButton
            ref={infoBox.ref('manager', 'START_MERGE')} onClick={startMerging}
            disabled={course.concepts.length < 2}
          >
            Start merge
          </CardHeaderButton>
        )
      }
    }
    return null
  }

  const conceptFilterParsed = parseFilter(conceptFilter)
  const includeConcept = concept =>
    concept.level === level
    && intIncludeConcept(concept, conceptFilterParsed)

  const scrollTopToCurrentHeight = () => {
    listRef.current.scrollTop = listRef.current.scrollHeight
    infoBox.redrawIfOpen('manager',
      'CREATE_CONCEPT_NAME',
      'CREATE_CONCEPT_DESCRIPTION',
      'CREATE_CONCEPT_TAGS',
      'CREATE_CONCEPT_SUBMIT')
  }

  const conceptArgs = {
    user, editing, deleteConcept, updateConcept, merging, setEditing, conceptTags,
    toggleMergingConcept, commonConcepts: level !== 'COMMON' ? workspace.commonConcepts : []
  }
  let conceptsToShow
  if (orderMethod !== 'GROUP_BY') {
    const conceptList = level === 'COMMON' ? workspace.commonConcepts || [] : orderedConcepts
    conceptsToShow = conceptList.map((concept, conceptIndex) =>
      includeConcept(concept) &&
      <ConceptListItem
        {...conceptArgs}
        key={concept.id}
        concept={concept}
        index={conceptIndex}
        sortable={sortable && orderMethod === 'CUSTOM' && !course.frozen}
        toggleMergingConcept={toggleMergingConcept}
        checkboxRef={conceptIndex === 0 ? infoBox.ref('manager', 'SELECT_MERGE_CONCEPTS')
          : conceptIndex === 1 ? infoBox.secondaryRef('manager', 'SELECT_MERGE_CONCEPTS')
            : undefined}
      />
    )
  } else {
    const conceptList = level === 'COMMON' ? workspace.commonConcepts : course.concepts
    groupConcepts(conceptList).flatMap((group, index, array) => {
      const elements = group.filter(concept => includeConcept(concept))
        .map((concept, conceptIndex) =>
          <ConceptListItem
            {...conceptArgs}
            key={concept.id}
            concept={concept}
            divider={false}
            checkboxRef={conceptIndex === 0 ? infoBox.ref('manager', 'SELECT_MERGE_CONCEPTS')
              : conceptIndex === 1 ? infoBox.secondaryRef('manager', 'SELECT_MERGE_CONCEPTS')
                : undefined}
            sortable={false}
          />
        )
      if (elements.length !== 0 && index < array.length - 1) {
        elements.push([<hr key={index} />])
      }
      return elements
    })
  }

  return (
    <Card elevation={0} className={classes.root}>
      <CardHeader
        classes={{ title: classes.header, content: classes.headerContent }}
        title={`${nameMap[level]} of ${workspace.name}`}
        action={cardHeaderActions()}
      />

      <div className={classes.filterBar}>
        <TextField
          variant='outlined'
          margin='dense'
          label={`Filter ${nameMap[level].toLowerCase()}`}
          ref={infoBox.ref('manager', 'FILTER_CONCEPTS')}
          value={conceptFilter}
          onChange={evt => setConceptFilter(evt.target.value)}
          className={classes.filterText}
        />
        { sortable &&
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
            className={classes.sortSelect}
          >
            {Object.entries(sortingOptions).map(([key, label]) =>
              <MenuItem key={key} value={key}>{label}</MenuItem>
            )}
          </TextField>
        }
      </div>

      {mergeDialogOpen !== null && <MergeDialog
        workspace={workspace} courseId={course.id} conceptIds={merging} close={closeMergeDialog}
        open={mergeDialogOpen.open}
      />}
      {conceptsToShow.length === 0 ? (
        <Typography variant='h5' align='center' gutterBottom>
            Add new {nameMap[level].toLowerCase()} below
        </Typography>
      ) : (
        <SortableList
          ref={listRef} className={classes.list} useDragHandle lockAxis='y' onSortEnd={onSortEnd}
        >
          {conceptsToShow}
        </SortableList>
      )}
      <ConceptEditor
        submit={async args => {
          await createConcept(args)
          scrollTopToCurrentHeight()
        }}
        commonSubmit={async args => {
          await createConceptFromCommon(args)
          scrollTopToCurrentHeight()
        }}
        action='Create'
        defaultValues={{ official: isTemplate, level }}
        tagOptions={conceptTags}
        commonConcepts={workspace.commonConcepts}
      />
    </Card>
  )
}

export default ConceptList
