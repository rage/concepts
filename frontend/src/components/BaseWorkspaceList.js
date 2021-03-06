import React, { useState } from 'react'
import {
  List, ListItem, ListItemText, ListItemSecondaryAction, Card, CardHeader, Typography, IconButton,
  Menu, MenuItem, ListItemIcon, ListSubheader, Divider, Button
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, GridOn as GridOnIcon, Share as ShareIcon,
  MoreVert as MoreVertIcon, CloudDownload as CloudDownloadIcon, Shuffle as ShuffleIcon,
  AccountTree as AccountTreeIcon, RadioButtonChecked, RadioButtonUnchecked, ArrowUpward as UpIcon,
  SyncAlt as SyncAltIcon, Notes as NotesIcon 
} from '@material-ui/icons'


import { Privilege } from '../lib/permissions'
import { exportWorkspace, exportMarkdown } from './WorkspaceNavBar'
import { useLoginStateValue, useMessageStateValue } from '../lib/store'
import useRouter from '../lib/useRouter'
import { useInfoBox } from './InfoBox'
import { useConfirm, useConfirmDelete } from '../dialogs/alert'

const useStyles = makeStyles(theme => ({
  root: {
    ...theme.mixins.gutters(),
    width: '100%',
    height: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    boxSizing: 'border-box',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  workspaceName: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  cancelButton: {
    marginTop: '16px',
    marginBottom: '16px'
  },
  list: {
    flex: 1,
    overflow: 'auto',
    padding: 0,
    backgroundColor: theme.palette.background.paper
  },
  progress: {
    margin: theme.spacing(2)
  },
  templateActive: {
    boxShadow: `inset 3px 0px ${theme.palette.primary.dark}`
  }
}))

export const TYPE_MAIN = 'mainWorkspaceList'
export const TYPE_USER = 'userWorkspaceList'
export const TYPE_TEMPLATE = 'templateList'
export const TYPE_MERGE = 'mergeList'

const TYPE_NAMES = {
  [TYPE_MAIN]: 'workspace',
  [TYPE_USER]: 'user workspace',
  [TYPE_TEMPLATE]: 'template',
  [TYPE_MERGE]: 'merge'
}

const BaseWorkspaceList = ({
  type, workspaces, activeTemplate, projectId, urlPrefix,
  openCreateDialog, openEditDialog, openShareDialog, cardHeaderAction, cardHeaderTitle,
  deleteWorkspace, setActiveTemplate, promoteMerge, style, templateNames
}) => {
  const classes = useStyles()
  const { history } = useRouter()
  const [{ user }] = useLoginStateValue()
  const [menu, setMenu] = useState({ open: false })
  const [, messageDispatch] = useMessageStateValue()
  const infoBox = useInfoBox()
  const confirmDelete = useConfirmDelete()
  const confirm = useConfirm()
  const [compareMode, setCompareMode] = useState({status: false, workspaceId: null})

  const handleCreateOpen = () => {
    handleMenuClose()
    openCreateDialog()
  }

  const cardHeaderActionGuide = () => {
    switch (type) {
    case TYPE_MAIN:
      return infoBox.ref('home', 'CREATE_WORKSPACE')
    case TYPE_TEMPLATE:
      return infoBox.ref('project', 'CREATE_TEMPLATE')
    case TYPE_USER:
      throw Error('This cardHeaderAction is specified in UserWorkspaceList.js')
    case TYPE_MERGE:
      throw Error('This cardHeaderAction is specified in MergeList.js')
    default:
      throw Error(`Invalid type ${type}`)
    }
  }

  const workspaceActionGuide = () => {
    switch (type) {
    case TYPE_MAIN:
      return infoBox.ref('home', 'WORKSPACE_ACTIONS')
    case TYPE_TEMPLATE:
      return infoBox.ref('project', 'TEMPLATE_ACTIONS')
    case TYPE_USER:
      return infoBox.ref('project', 'WORKSPACE_ACTIONS')
    case TYPE_MERGE:
      return infoBox.ref('project', 'MERGE_ACTIONS')
    default:
      throw Error(`Invalid type ${type}`)
    }
  }

  const gotoGuide = () => {
    switch (type) {
    case TYPE_MAIN:
      return infoBox.ref('home', 'GOTO_WORKSPACE')
    case TYPE_TEMPLATE:
      return infoBox.ref('project', 'GOTO_TEMPLATE')
    case TYPE_USER:
      return infoBox.ref('project', 'GOTO_USER_WORKSPACE')
    case TYPE_MERGE:
      return infoBox.ref('project', 'GOTO_MERGE')
    default:
      throw Error(`Invalid type ${type}`)
    }
  }

  cardHeaderAction = cardHeaderAction || (
    <IconButton
      aria-label='Add'
      onClick={handleCreateOpen}
      ref={cardHeaderActionGuide()}
    >
      <AddIcon />
    </IconButton>
  )

  const handleMenuOpen = (workspace, event) => {
    setMenu({
      anchor: event.currentTarget,
      open: true,
      workspace
    })
  }

  const handleMenuClose = () => {
    setMenu({
      ...menu,
      open: false
    })
  }

  const handleWorkspaceExport = async () => {
    handleMenuClose()
    try {
      await exportWorkspace(menu.workspace.id)
    } catch (err) {
      messageDispatch({
        type: 'setError',
        data: err.message
      })
    }
  }

  const handleWorkspaceMarkdown = async () => {
    handleMenuClose()
    try {
      await exportMarkdown(menu.workspace.id)
    } catch (err) {
      messageDispatch({
        type: 'setError',
        data: err.message
      })
    }
  }

  const handleEditOpen = () => {
    handleMenuClose()
    openEditDialog(menu.workspace.id, menu.workspace.name)
  }

  const handleShareOpen = () => {
    handleMenuClose()
    openShareDialog(menu.workspace.id, Privilege.EDIT)
  }

  const handleCompareMode = () => {
    setCompareMode({ status: true, workspaceId: menu.workspace.id })
    handleMenuClose()
  }

  const cancelCompareMode = () => {
    setCompareMode({ status: false, workspaceId: null })
  }

  const handleDelete = async () => {
    handleMenuClose()

    if (!await confirmDelete(`Are you sure you want to delete this ${TYPE_NAMES[type]}?`)) {
      return
    }
    try {
      await deleteWorkspace({
        variables: { id: menu.workspace.id }
      })
    } catch (err) {
      messageDispatch({
        type: 'setError',
        data: 'Access denied'
      })
    }
  }

  const handleSetActive = async () => {
    handleMenuClose()

    if (activeTemplate && menu.workspace.id !== activeTemplate.id) {
      const change = await confirm({
        title: 'Confirm active template switch',
        message: `Are you sure that you want to switch the active template? 
This will change which template is cloned by users.`,
        confirm: 'Yes, switch',
        cancel: 'No, cancel'
      })
      if (!change) return
    }
    try {
      await setActiveTemplate({
        variables: { projectId, workspaceId: menu.workspace.id }
      })
    } catch (err) {
      messageDispatch({
        type: 'setError',
        data: err.message
      })
    }
  }

  const handlePromoteMerge = async () => {
    handleMenuClose()
    try {
      await promoteMerge({
        variables: {
          projectId,
          workspaceId: menu.workspace.id
        }
      })
    } catch (err) {
      messageDispatch({
        type: 'setError',
        data: err.message
      })
    }
  }

  const handleNavigateManager = (workspaceId) => {
    history.push(`${urlPrefix}/${workspaceId}/manager`)
  }

  const handleNavigateCourseMapper = () => {
    history.push(`${urlPrefix}/${menu.workspace.id}/mapper`)
  }

  const handleNavigateConceptMapper = () => {
    history.push(`${urlPrefix}/${menu.workspace.id}/conceptmapper`)
  }

  const handleNavigateHeatmap = () => {
    history.push(`${urlPrefix}/${menu.workspace.id}/heatmap`)
  }

  const handleNavigateComparisonView = (workspaceId) => {
    history.push(`${urlPrefix}/comp/${compareMode.workspaceId}/w/${workspaceId}`)
  }

  const isActiveTemplate = (menu.workspace && activeTemplate) &&
    menu.workspace.id === activeTemplate.id

  const secondaryText = workspace => {
    const id = workspace.participants
      .find(p => Privilege.fromString(p.privilege) === Privilege.OWNER)?.user?.id
    if (id === user.id) {
      return <><strong>You</strong> ({id})</>
    }
    return id
  }

  const makeWorkspaceItem = (workspace, index) => (
    <ListItem
      className={workspace.id === activeTemplate?.id ? classes.templateActive : ''}
      button
      key={workspace.id}
      onClick={() => handleNavigateManager(workspace.id)}
      ref={index === 0
        ? gotoGuide() : undefined}
    >
      <ListItemText
        primary={
          <Typography className={classes.workspaceName} variant='h6' style={{color: compareMode.workspaceId == workspace.id ? 'red' : 'black'}}>
            {workspace.name}
          </Typography>
        }
        secondary={type === TYPE_USER && secondaryText(workspace)}
      />

      <ListItemSecondaryAction>
        { compareMode.status ? 
          <IconButton onClick={() => {
            handleNavigateComparisonView(workspace.id)
          }}>
              <SyncAltIcon />
          </IconButton> : 
          <IconButton
            onClick={evt => handleMenuOpen(workspace, evt)}
            aria-haspopup='true'
            ref={index === 0 ? workspaceActionGuide() : undefined}
          >
            <MoreVertIcon />
          </IconButton>
      }
      </ListItemSecondaryAction>
    </ListItem>
  )

  let workspaceList
  if (type === TYPE_USER) {
    const sublistMap = {}
    for (const ws of workspaces) {
      if (!sublistMap.hasOwnProperty(ws.sourceTemplate.id)) {
        sublistMap[ws.sourceTemplate.id] = [
          <ListSubheader key={ws.sourceTemplate.id}>
            <Typography>
              Cloned from <strong>{templateNames.get(ws.sourceTemplate.id)}</strong>
            </Typography>
          </ListSubheader>,
          makeWorkspaceItem(ws)
        ]
      } else {
        sublistMap[ws.sourceTemplate.id].push(makeWorkspaceItem(ws))
      }
    }
    workspaceList = activeTemplate === null ? [] : [
      sublistMap[activeTemplate.id],
      <Divider style={{ marginBottom: '8px' }} key={`divider-${activeTemplate.id}`} />,
      ...Object.entries(sublistMap)
        .flatMap(([id, list]) =>
          id !== activeTemplate.id
            ? [...list, <Divider style={{ marginBottom: '8px' }} key={`divider-${id}`} />]
            : [])
    ].slice(0, -1)
  } else {
    workspaceList = workspaces.map((workspace, index) => makeWorkspaceItem(workspace, index))
  }

  return (
    <Card elevation={0} className={classes.root} style={style}>
      <CardHeader action={cardHeaderAction} title={cardHeaderTitle} />
      <List dense={false} className={classes.list}>{workspaceList}</List>
      <Menu anchorEl={menu.anchor} open={menu.open} onClose={handleMenuClose}>
        <MenuItem aria-label='Mapper' onClick={handleNavigateCourseMapper}>
          <ListItemIcon>
            <AccountTreeIcon />
          </ListItemIcon>
          Course Mapper
        </MenuItem>
        <MenuItem aria-label='Mapper' onClick={handleNavigateConceptMapper}>
          <ListItemIcon>
            <ShuffleIcon />
          </ListItemIcon>
          Concept Mapper
        </MenuItem>
        <MenuItem aria-label='Heatmap' onClick={handleNavigateHeatmap}>
          <ListItemIcon>
            <GridOnIcon />
          </ListItemIcon>
          Heatmap
        </MenuItem>
        <MenuItem aria-label='Export JSON' onClick={handleWorkspaceExport}>
          <ListItemIcon>
            <CloudDownloadIcon />
          </ListItemIcon>
          Export JSON
        </MenuItem>
        <MenuItem aria-label='Export markdown' onClick={handleWorkspaceMarkdown}>
          <ListItemIcon>
            <NotesIcon />
          </ListItemIcon>
          Export markdown
        </MenuItem>
        {type !== TYPE_USER &&
          <MenuItem aria-label='Share link' onClick={handleShareOpen}>
            <ListItemIcon>
              <ShareIcon />
            </ListItemIcon>
            Share link
          </MenuItem>
        }
        {type === TYPE_TEMPLATE &&
          <MenuItem onClick={handleSetActive} disabled={isActiveTemplate}>
            <ListItemIcon>
              {isActiveTemplate
                ? <RadioButtonChecked />
                : <RadioButtonUnchecked />
              }
            </ListItemIcon>
            {!isActiveTemplate ? 'Set as' : 'Is'} active
          </MenuItem>
        }
        {type === TYPE_MERGE &&
          <MenuItem onClick={handlePromoteMerge}>
            <ListItemIcon>
              <UpIcon />
            </ListItemIcon>
            Promote to template
          </MenuItem>
        }
        {type !== TYPE_TEMPLATE && projectId &&
          <MenuItem aria-label='Compare' onClick={handleCompareMode}>
            <ListItemIcon>
              <SyncAltIcon />
            </ListItemIcon>
            Compare
          </MenuItem>
        }
        {type !== TYPE_USER &&
          <MenuItem aria-label='Edit' onClick={handleEditOpen}>
            <ListItemIcon>
              <EditIcon />
            </ListItemIcon>
            Edit
          </MenuItem>
        }
        <MenuItem aria-label='Delete' onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>
      {
        compareMode.status && 
          <Button color='primary' variant='outlined' 
          className={classes.cancelButton} onClick={cancelCompareMode}> Cancel  comparison </Button>
      }
    </Card>
  )
}

export default BaseWorkspaceList
