import React from 'react'
import { withRouter } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import { Button, Card, CardHeader, CardContent, List, IconButton } from '@material-ui/core'
import { Edit as EditIcon } from '@material-ui/icons'

import Concept from './concept/Concept'
import { useLoginStateValue } from '../../store'
import useCreateConceptDialog from '../../dialogs/concept/useCreateConceptDialog'

const useStyles = makeStyles(theme => ({
  root: {
    width: '280px',
    margin: '0px 8px 16px 8px'
  },
  list: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
    paddingBottom: theme.spacing(2),
    position: 'relative'
  },
  cardHeader: {
    paddingBottom: '0px'
  },
  title: {
    overflowWrap: 'break-word',
    hyphens: 'auto',
    '&:hover': {
      textDecoration: 'underline',
      cursor: 'pointer'
    }

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
    width: '100%'
  }
}))

const Course = ({
  course,
  connectionRef,
  createConceptRef,
  activeCourseId,
  addingLink,
  setAddingLink,
  openCourseDialog,
  openConceptEditDialog,
  activeConceptIds,
  history,
  workspaceId,
  urlPrefix
}) => {
  const { loggedIn } = useLoginStateValue()[0]
  const classes = useStyles()
  const openCreateConceptDialog = useCreateConceptDialog(activeCourseId, workspaceId, true)

  const onHeaderClickHandle = () => {
    history.push(`${urlPrefix}/${workspaceId}/mapper/${course.id}`)
  }

  return (
    <Card elevation={0} className={classes.root}>
      <CardHeader
        className={classes.cardHeader}
        title={
          <span className={classes.title} onClick={(onHeaderClickHandle)}>{course.name}</span>
        }
        action={
          loggedIn ?
            <IconButton onClick={openCourseDialog(course.id, course.name)}>
              <EditIcon />
            </IconButton>
            : null
        }>
      </CardHeader>

      <CardContent>
        <List className={classes.list}>
          {course.concepts.map((concept, index) =>
            <Concept concept={concept}
              key={concept.id}
              course={course}
              connectionRef={index === 0 ? connectionRef : undefined}
              activeConceptIds={activeConceptIds}
              addingLink={addingLink}
              setAddingLink={setAddingLink}
              openConceptEditDialog={openConceptEditDialog}
              activeCourseId={activeCourseId}
              workspaceId={workspaceId}
            />
          )}
        </List>
        {
          loggedIn ?
            <Button
              className={classes.button}
              onClick={() => openCreateConceptDialog(course.id)}
              variant='contained'
              color='primary'
              ref={createConceptRef}
            >
              Add concept
            </Button>
            : null
        }

      </CardContent>
    </Card>
  )
}

export default withRouter(Course)
