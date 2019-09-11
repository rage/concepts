import React, { useState } from 'react'
import { useQuery, useMutation } from 'react-apollo-hooks'
import { withRouter } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import {
  BottomNavigation, BottomNavigationAction, Paper, IconButton, Menu, MenuItem, ListItemIcon
} from '@material-ui/core'
import {
  Shuffle as ShuffleIcon, Delete as DeleteIcon, Edit as EditIcon, Group as GroupIcon,
  MoreVert as MoreVertIcon, Share as ShareIcon, Timelapse as TimelapseIcon
} from '@material-ui/icons'

import { PROJECT_BY_ID, PROJECTS_FOR_USER } from '../graphql/Query'
import { DELETE_PROJECT } from '../graphql/Mutation'
import { useMessageStateValue, useLoginStateValue } from '../store'
import { useShareDialog } from '../dialogs/sharing'
import useEditProjectDialog from '../dialogs/project/useEditProjectDialog'

const useStyles = makeStyles({
  root: {
    gridArea: 'bottom-navbar',
    display: 'flex',
    justifyContent: 'space-between'
  },
  leftPlaceholder: {
    width: '56px',
    height: '56px'
  },
  navbar: {
    flex: 1,
    zIndex: 2
  },
  menuButton: {
    width: '56px',
    height: '56px'
  }
})

const deletionMsg = `Are you sure you want to delete this project?
This action is IRREVERSIBLE!
Consider your actions.`

const ProjectNavBar = ({ history, page, projectId, urlPrefix }) => {
  const classes = useStyles()
  const [{ user }] = useLoginStateValue()
  const [, messageDispatch] = useMessageStateValue()
  const [menuAnchor, setMenuAnchor] = useState(null)

  const projectQuery = useQuery(PROJECT_BY_ID, {
    variables: { id: projectId }
  })

  const deleteProject = useMutation(DELETE_PROJECT, {
    refetchQueries: [
      { query: PROJECTS_FOR_USER }
    ]
  })

  const openEditProjectDialog = useEditProjectDialog(projectId)
  const openShareProjectDialog = useShareDialog('project')

  const handleEditOpen = () => {
    setMenuAnchor(null)
    openEditProjectDialog(projectId, projectQuery.data.projectById.name)
  }

  const handleShareOpen = () => {
    setMenuAnchor(null)
    openShareProjectDialog(projectId, 'EDIT')
  }

  const handleDelete = () => {
    setMenuAnchor(null)
    const youAreSure = window.confirm(deletionMsg)
    if (youAreSure) {
      deleteProject({
        variables: {
          id: projectId
        }
      })
        .catch(() => {
          messageDispatch({
            type: 'setError',
            data: 'Failed to delete project'
          })
          setTimeout(() =>
            messageDispatch({ type: 'clearError' })
          , 2000)
        })
        .finally(() => {
          history.push('/')
        })
    }
  }

  const onChange = (event, newPage) => {
    history.push(`${urlPrefix}/${projectId}/${newPage}`)
  }

  const isOwner = ((projectQuery.data.projectById
    && projectQuery.data.projectById.participants.find(pcp => pcp.user.id === user.id)) || {}
  ).privilege === 'OWNER'

  return (
    <>
      <Paper className={classes.root} square>
        { /* Placeholder so flex would align navbar at center*/
          user.role === 'STAFF' && <div className={classes.leftPlaceholder} />
        }
        <BottomNavigation showLabels value={page} onChange={onChange} className={classes.navbar}>
          <BottomNavigationAction
            value='overview'
            label='Project overview'
            icon={<ShuffleIcon />}
          />
          <BottomNavigationAction
            value='points'
            label='Points'
            icon={<TimelapseIcon />}
          />
          {isOwner && <BottomNavigationAction
            value='members'
            label='Members'
            icon={<GroupIcon />}
          />}
        </BottomNavigation>
        {user.role === 'STAFF' && <>
          <IconButton
            onClick={evt => setMenuAnchor(evt.currentTarget)}
            className={classes.menuButton}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right'
            }}
            transformOrigin={{
              vertical: 'bottom',
              horizontal: 'right'
            }}>
            {
              projectQuery.data.projectById && projectQuery.data.projectById.participants.find(p =>
                p.user.id === user.id && p.privilege === 'OWNER') &&
              <MenuItem aria-label='Share link' onClick={handleShareOpen}>
                <ListItemIcon>
                  <ShareIcon />
                </ListItemIcon>
                Share link
              </MenuItem>
            }
            <MenuItem aria-label='Delete' onClick={handleDelete}>
              <ListItemIcon>
                <DeleteIcon />
              </ListItemIcon>
              Delete
            </MenuItem>
            <MenuItem aria-label='Edit' onClick={handleEditOpen}>
              <ListItemIcon>
                <EditIcon />
              </ListItemIcon>
              Edit
            </MenuItem>
          </Menu>
        </>}
      </Paper>
    </>
  )
}

export default withRouter(ProjectNavBar)
