import React, { useMemo } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Button, Paper, Select, MenuItem, InputBase, List, IconButton
} from '@material-ui/core'
import { Edit as EditIcon } from '@material-ui/icons'

import { Role } from '../../lib/permissions'
import { Concept } from './concept'
import { useCreateConceptDialog } from '../../dialogs/concept'
import { useEditCourseDialog } from '../../dialogs/course'
import { useLoginStateValue } from '../../lib/store'
import { useInfoBox } from '../../components/InfoBox'
import DividerWithText from '../../components/DividerWithText'
import useRouter from '../../lib/useRouter'
import { sortedConcepts, sortedCourses } from '../manager/ordering'

const useStyles = makeStyles(theme => ({
  root: {
    gridArea: 'activeCourse',
    display: 'flex',
    flexDirection: 'column',
    padding: '16px',
    boxSizing: 'border-box',
    margin: '0 8px',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  title: {
    maxWidth: 'calc(100% - 48px)',
    overflowWrap: 'break-word',
    hyphens: 'auto'
  },
  titleSelect: {
    fontSize: '1.4rem',
    fontWeight: 'bold'
  },
  titleEditWrapper: {
    flex: '0 0 auto',
    alignSelf: 'flex-start',
    marginRight: '-8px'
  },
  list: {
    backgroundColor: theme.palette.background.paper,
    overflow: 'auto',
    flex: 1
  },
  listSection: {
    backgroundColor: 'inherit'
  },
  ul: {
    backgroundColor: 'inherit',
    padding: 0
  },
  highlight: {
    backgroundColor: 'cyan'
  },
  button: {
    marginTop: '16px',
    width: '100%'
  }
}))

const ActiveCourse = ({
  course,
  workspace,
  focusedConceptIds,
  addingLink,
  setAddingLink,
  flashLink,
  toggleFocus,
  urlPrefix
}) => {
  const classes = useStyles()
  const { history } = useRouter()
  const infoBox = useInfoBox()
  const [{ user }] = useLoginStateValue()

  const openCreateConceptDialog = useCreateConceptDialog(workspace.id, user.role >= Role.STAFF)
  const openEditCourseDialog = useEditCourseDialog(workspace.id, user.role >= Role.STAFF)

  const orderedConcepts = useMemo(() => sortedConcepts(course.concepts, course.conceptOrder),
    [course.concepts, course.conceptOrder])
  const orderedCourses = useMemo(() => sortedCourses(workspace.courses, workspace.courseOrder),
    [workspace.courses, workspace.courseOrder])

  return <>
    <DividerWithText
      content='Editing course'
      gridArea='activeHeader'
      margin='0px 8px 0px 8px'
    />
    <Paper onClick={() => setAddingLink(null)} elevation={0} className={classes.root}>
      <div title={course.name} className={classes.header}>
        <Select
          value={course.id}
          classes={{ root: classes.titleSelect }}
          input={<InputBase classes={{ root: classes.title }} />}
          onChange={evt => history.push(`${urlPrefix}/${workspace.id}/mapper/${evt.target.value}`)}
        >
          {orderedCourses.map(course =>
            <MenuItem key={course.id} value={course.id}>{course.name}</MenuItem>
          )}
        </Select>
        <div className={classes.titleEditWrapper}>
          <IconButton
            onClick={() => openEditCourseDialog(course)}
            disabled={(course.frozen && user.role < Role.STAFF)}
          >
            <EditIcon />
          </IconButton>
        </div>
      </div>

      <List className={classes.list}>
        {orderedConcepts.map((concept, index) =>
          <Concept
            conceptLinkRef={index === 0
              ? infoBox.secondaryRef('mapper', 'DRAW_LINK') : undefined}
            activeConceptRef={index === 0 ? infoBox.ref('mapper', 'FOCUS_CONCEPT') : undefined}
            isActive
            concept={concept}
            key={concept.id}
            focusedConceptIds={focusedConceptIds}
            addingLink={addingLink}
            setAddingLink={setAddingLink}
            flashLink={flashLink}
            toggleFocus={toggleFocus}
            activeCourseId={course.id}
            workspaceId={workspace.id}
          />
        )}
      </List>

      <Button
        className={classes.button}
        onClick={() => openCreateConceptDialog(course.id)}
        variant='contained'
        color='secondary'
        ref={infoBox.ref('mapper', 'CREATE_CONCEPT_TARGET')}
      >
        Add concept
      </Button>
    </Paper>
  </>
}

export default React.memo(ActiveCourse)
