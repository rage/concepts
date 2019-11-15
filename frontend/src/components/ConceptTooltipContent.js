import React from 'react'
import { Chip, Typography } from '@material-ui/core'

import { getTagColor } from '../dialogs/tagSelectUtils'

const ConceptToolTipContent = ({ description, tags }) => (
  <div style={{ padding: '2px' }}>
    <Typography variant='body1'>
      {description}
    </Typography>
    {tags.map(tag =>
      <Chip
        style={{
          borderColor: getTagColor(tag),
          color: getTagColor(tag),
          margin: '5px 5px 5px 0px'
        }}
        key={tag.id}
        variant='outlined'
        size='small'
        label={tag.name}
      />)}
  </div>
)

export default ConceptToolTipContent
