import React, { useState } from 'react'
import { Menu, MenuItem } from '@material-ui/core'
import { useMutation, useQuery } from '@apollo/react-hooks'

import { WORKSPACE_BY_ID } from '../../graphql/Query'
import LoadingBar from '../../components/LoadingBar'
import NotFoundView from '../error/NotFoundView'
import { CREATE_GOAL_LINK, DELETE_GOAL_LINK } from '../../graphql/Mutation'
import cache from '../../apollo/update'
import ConceptLink from '../../components/ConceptLink'
import { backendToSelect } from '../../dialogs/tagSelectUtils'
import { Courses } from './Courses'
import { Goals } from './Goals'
import { useStyles } from './styles'

import {
  useUpdatingSubscription,
  useManyUpdatingSubscriptions
} from '../../apollo/useUpdatingSubscription'

const GoalView = ({ workspaceId }) => {
  const classes = useStyles()
  const [addingLink, setAddingLink] = useState(null)
  const [menu, setMenu] = useState({ open: false })

  useManyUpdatingSubscriptions(['course', 'concept'], ['create', 'delete', 'update'], {
    variables: { workspaceId }
  })

  const [createGoalLink] = useMutation(CREATE_GOAL_LINK, {
    update: cache.createGoalLinkUpdate(workspaceId)
  })

  const [deleteGoalLink] = useMutation(DELETE_GOAL_LINK, {
    update: cache.deleteGoalLinkUpdate(workspaceId)
  })

  const workspaceQuery = useQuery(WORKSPACE_BY_ID, {
    variables: { id: workspaceId }
  })

  if (workspaceQuery.loading) {
    return <LoadingBar id='workspace-management' />
  } else if (workspaceQuery.error) {
    return <NotFoundView message='Workspace not found' />
  }

  const openMenu = (evt, id) => {
    evt.preventDefault()
    setMenu({
      open: true,
      id,
      anchor: {
        left: evt.pageX + window.pageXOffset,
        top: evt.pageY + window.pageYOffset
      }
    })
  }
  const closeMenu = () => setMenu({ ...menu, open: false })
  const deleteLink = () => {
    deleteGoalLink({ variables: { id: menu.id } })
    closeMenu()
  }

  const onClickCircle = (type, id) => evt => {
    evt.stopPropagation()
    if (!addingLink) {
      setAddingLink({ type, id })
    } else if (type !== addingLink.type) {
      createGoalLink({
        variables: {
          workspaceId,
          goalId: type === 'goal' ? id : addingLink.id,
          courseId: type === 'course' ? id : addingLink.id
        }
      })
        .catch(console.error)
        .finally(() => setAddingLink(null))
    }
  }

  const goalLinks = workspaceQuery.data.workspaceById.goalLinks
  const courses = workspaceQuery.data.workspaceById.courses
  const goals = workspaceQuery.data.workspaceById.goals

  const goalTags = backendToSelect(workspaceQuery.data.workspaceById.goalTags)
  const courseTags = backendToSelect(workspaceQuery.data.workspaceById.courseTags)

  return (
    <div className={classes.root} onClick={() => setAddingLink(null)}>
      <h1 className={classes.title}>Goal Mapping</h1>
      <Courses
        courses={courses}
        workspaceId={workspaceId}
        tagOptions={courseTags}
        onClickCircle={onClickCircle}
      />
      <div style={{ gridArea: 'space' }} />
      <Goals
        goals={goals}
        workspaceId={workspaceId}
        tagOptions={goalTags}
        onClickCircle={onClickCircle}
      />
      <div>
        {goalLinks.map(link => <ConceptLink
          key={`goal-link-${link.id}`} delay={1} active linkId={link.id}
          from={`goal-circle-${link.goal.id}`} to={`course-circle-${link.course.id}`}
          fromConceptId={link.goal.id} toConceptId={link.course.id}
          fromAnchor='center middle' toAnchor='center middle' posOffsets={{ x0: +5, x1: -6 }}
          onContextMenu={openMenu}
        />)}
        {addingLink && <ConceptLink
          active within={document.body} followMouse
          from={`${addingLink.type}-circle-${addingLink.id}`}
          to={`${addingLink.type}-circle-${addingLink.id}`}
        />}
      </div>
      <Menu
        anchorReference='anchorPosition'
        anchorPosition={menu.anchor}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        open={menu.open}
        onClose={closeMenu}
      >
        <MenuItem onClick={deleteLink}>Delete link</MenuItem>
      </Menu>
    </div>
  )
}

export default GoalView
