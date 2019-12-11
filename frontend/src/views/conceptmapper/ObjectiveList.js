import React from 'react'

import { SortableList } from '../../lib/sortableMoc'
import ObjectiveNode from './ObjectiveNode'
import { ConceptLink } from '../coursemapper/concept'

const ObjectiveList = ({ objectiveOrder, concepts, openMenu, closeMenu, className }) => <>
  <SortableList className={className}>
    {concepts.map((concept, index) =>
      <ObjectiveNode
        key={concept.id} concept={concept} index={index}
        openMenu={openMenu('objective', concept.id)}
        closeMenu={closeMenu(concept.id)}
      />
    )}
  </SortableList>
  {concepts.flatMap(concept => [
    <ConceptLink key={concept.id} />,
    ...concept.linksToConcept.map(link => <ConceptLink
      key={link.id} delay={1} active linkId={link.id}
      within='concept-mapper-link-container' // posOffsets={linkOffsets}
      onContextMenu={openMenu('concept-link', link.id)}
      // scrollParentRef={pan}
      from={`objective-${concept.id}`} to={`concept-${link.from.id}`}
      fromConceptId={concept.id} toConceptId={link.from.id}
      fromAnchor='center middle' toAnchor='center middle'
    />)
  ])}
</>

export default ObjectiveList
