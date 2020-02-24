import React, { useRef, useState } from 'react'
import { useQuery } from 'react-apollo-hooks'
import { IconButton, makeStyles, Menu, MenuItem, Tooltip } from '@material-ui/core'
import {
  Star as StarIcon, StarBorder as StarBorderIcon, StarHalf as StarHalfIcon
} from '@material-ui/icons'

import { ConceptLink } from './concept'
import { LINKS_IN_COURSE } from '../../graphql/Query'

const useStyles = makeStyles({
  root: {
    display: 'grid',
    // For some reason, this makes the 1fr sizing work without needing to hardcode heights of other
    // objects in the parent-level grid.
    overflow: 'hidden',
    gridTemplate: `"traySpacer traySpacer contentHeader activeHeader" 42px
                   "courseTray trayButton courses       activeCourse" 1fr
                  / 0          64px       8fr           3fr`,
    '&$courseTrayOpen': {
      gridTemplateColumns: '3fr 64px 7fr 3fr'
    },
    '@media screen and (max-width: 1999px)': {
      gridTemplateColumns: '0 64px 6fr 3fr',
      '&$courseTrayOpen': {
        gridTemplateColumns: '3fr 64px 5fr 3fr'
      }
    },
    '@media screen and (max-width: 1499px)': {
      gridTemplateColumns: '0 64px 4fr 3fr',
      '&$courseTrayOpen': {
        gridTemplateColumns: '3fr 64px 3fr 3fr'
      }
    }
  },
  courseTrayOpen: {},
  conceptLinkFlash: {
    animation: '$flash 3s'
  },
  '@keyframes flash': {
    '0%': { borderTopColor: '#f50057' },
    '25%': { borderTopColor: '#f50057' },
    '100%': { borderTopColor: 'rgba(117, 117, 117, 0.1)' }
  },
  conceptLinkWrapperFlash: {
    '&:before': {
      animation: '$flashWrapper 3s'
    }
  },
  '@keyframes flashWrapper': {
    '0%': { borderRightColor: 'red' },
    '25%': { borderRightColor: 'red' },
    '100%': { borderRightColor: '#f1f1f1' }
  }
})

const MapperLinks = ({
  courseId, flashingLink, addingLink, focusedConceptIds, conceptLinkMenu, courseLinkMap,
  collapsedCourseIds, handleMenuOpen, handleMenuClose, deleteLink, updateLink, setWeight
}) => {
  const classes = useStyles()
  const conceptLinkMenuRef = useRef()
  const [editingLink, setEditingLink] = useState(null)

  const linkQuery = useQuery(LINKS_IN_COURSE, {
    variables: { courseId }
  })

  const showLink = link => courseLinkMap.has(link.from.course.id)
    && !collapsedCourseIds.has(link.from.course.id)

  const editLink = () => {
    setEditingLink(conceptLinkMenu.linkId)
    handleMenuClose()
  }

  const stopEdit = (id, text) => {
    if (typeof text === 'string') {
      updateLink({ variables: { id, text } })
    }
    setEditingLink(null)
  }

  return <div style={{ display: 'contents' }}>
    {linkQuery.data.linksInCourse?.concepts.map(concept =>
      concept.linksToConcept.map(link => showLink(link) &&
        <ConceptLink
          key={`concept-link-${link.id}`} delay={1}
          active={flashingLink === link.id || (!addingLink && (
            focusedConceptIds.has(concept.id) || focusedConceptIds.has(link.from.id)
          ))}
          linkId={link.id} text={link.text} editing={editingLink === link.id} stopEdit={stopEdit}
          to={`concept-circle-active-${concept.id}`} from={`concept-circle-${link.from.id}`}
          toConceptId={concept.id} fromConceptId={link.from.id} weight={link.weight}
          fromAnchor='center middle' toAnchor='center middle' onContextMenu={handleMenuOpen}
          posOffsets={{ x0: -6, x1: +5 }}
          classes={flashingLink === link.id && !focusedConceptIds.has(concept.id)
          && !focusedConceptIds.has(link.from.id)
            ? {
              line: classes.conceptLinkFlash,
              wrapper: classes.conceptLinkWrapperFlash
            }
            : {}
          }
        />
      )
    )}
    <div ref={conceptLinkMenuRef} style={{
      position: 'absolute',
      width: '1px',
      height: '1px',
      top: `${conceptLinkMenu ? conceptLinkMenu.y : -1}px`,
      left: `${conceptLinkMenu ? conceptLinkMenu.x : -1}px`
    }} />
    <LinkMenu
      anchorEl={conceptLinkMenuRef.current}
      anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      onClose={handleMenuClose}
      open={Boolean(conceptLinkMenu) && Boolean(conceptLinkMenuRef.current)}
      deleteLink={deleteLink}
      editLink={editLink} setWeight={setWeight} weight={conceptLinkMenu?.weight}
    />
    {addingLink && <ConceptLink
      active within={document.body} // This needs to be directly in body to work
      from={addingLink.type === 'concept-circle' && `${addingLink.type}-${addingLink.id}`}
      to={addingLink.type === 'concept-circle-active' && `${addingLink.type}-${addingLink.id}`}
      followMouse posOffsets={{
        x0: addingLink.type === 'concept-circle-active' ? -7 : 0,
        x1: addingLink.type === 'concept-circle' ? 7 : 0
      }}
    />}
  </div>
}

export const LinkMenu = ({ deleteLink, editLink, weight, setWeight, ...args }) => (
  <Menu {...args}>
    <MenuItem onClick={deleteLink}>Delete link</MenuItem>
    <MenuItem onClick={editLink}>Edit link text</MenuItem>
    <MenuItem dense>
      <IconButton color={weight === 50 ? 'secondary' : undefined} onClick={setWeight(50)}>
        <Tooltip arrow title='Optional'><StarBorderIcon /></Tooltip>
      </IconButton>
      <IconButton color={weight === 100 ? 'secondary' : undefined} onClick={setWeight(100)}>
        <Tooltip arrow title='Recommended'><StarHalfIcon /></Tooltip>
      </IconButton>
      <IconButton color={weight === 150 ? 'secondary' : undefined} onClick={setWeight(150)}>
        <Tooltip arrow title='Mandatory'><StarIcon /></Tooltip>
      </IconButton>
    </MenuItem>
  </Menu>
)

export default MapperLinks
