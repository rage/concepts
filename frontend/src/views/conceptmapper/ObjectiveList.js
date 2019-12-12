import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { makeStyles } from '@material-ui/core/styles'

import { SortableList } from '../../lib/sortableMoc'
import ObjectiveNode from './ObjectiveNode'
import { ConceptLink } from '../coursemapper/concept'
import { sortedConcepts } from '../../lib/ordering'
import arrayShift from '../../lib/arrayShift'

const useStyles = makeStyles({
  root: {
    flex: 1
  }
})

const ObjectiveList = ({ workspaceId, order, concepts, openMenu, closeMenu }) => {
  const classes = useStyles()

  const isOrdered = order.length === 1 && order[0].startsWith('__ORDER_BY__')
  const defaultOrderMethod = isOrdered ? order[0].substr('__ORDER_BY__'.length) : 'CUSTOM'
  const [orderedConcepts, setOrderedConcepts] = useState([])
  const [orderMethod, setOrderMethod] = useState(defaultOrderMethod)
  const [dirtyOrder, setDirtyOrder] = useState(null)

  useEffect(() => {
    if (!dirtyOrder && defaultOrderMethod !== orderMethod) {
      setOrderMethod(defaultOrderMethod)
    }
    if (!dirtyOrder || orderMethod !== 'CUSTOM') {
      setOrderedConcepts(sortedConcepts(concepts, order, orderMethod))
    }
  }, [concepts, order, dirtyOrder, defaultOrderMethod, orderMethod])

  const onSortEnd = ({ oldIndex, newIndex }) =>
    ReactDOM.unstable_batchedUpdates(() => {
      setOrderedConcepts(items => arrayShift(items, oldIndex, newIndex))
      if (!dirtyOrder) setDirtyOrder('yes')
      if (orderMethod !== 'CUSTOM') setOrderMethod('CUSTOM')
    })

  return <>
    <SortableList className={classes.root} useDragHandle lockAxis='y' onSortEnd={onSortEnd}>
      {orderedConcepts.map((concept, index) =>
        <ObjectiveNode
          key={concept.id} concept={concept} index={index} workspaceId={workspaceId}
          openMenu={openMenu('objective', concept.id)}
          closeMenu={closeMenu(concept.id)}
        />
      )}
    </SortableList>
    {concepts.flatMap(concept => [
      ...concept.linksToConcept.map(link => <ConceptLink
        key={link.id} delay={1} active linkId={link.id}
        within='concept-mapper-link-container' // posOffsets={linkOffsets}
        onContextMenu={openMenu('concept-link', link.id)}
        posOffsets={{ x1: +6 }} toAnchor='center middle'
        // scrollParentRef={pan}
        from={`objective-${concept.id}`} to={`concept-${link.from.id}`}
        fromConceptId={concept.id} toConceptId={link.from.id}
      />)
    ])}
  </>
}

export default ObjectiveList
