import React from 'react'
import { Chip, Typography } from '@material-ui/core'

import { getTagColor } from '../dialogs/tagSelectUtils'

const ConceptToolTipContent = ({ description, subtitle, tags }) => (
  <div style={{ padding: '2px' }}>
    <Typography variant='body1' style={{
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: '-webkit-box',
      WebkitBoxOrient: 'vertical',
      WebkitLineClamp: 5
    }}>
      {description}
    </Typography>
    {
      subtitle && <Typography variant='subtitle2' color='textSecondary' noWrap>
        {subtitle}
      </Typography>
    }
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
