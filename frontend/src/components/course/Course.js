import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'

// Card
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'

// List
import List from '@material-ui/core/List'

// Icons
import IconButton from '@material-ui/core/IconButton'
import EditIcon from '@material-ui/icons/Edit'

import { withRouter } from 'react-router-dom'
import Concept from '../concept/Concept'

import { useLoginStateValue } from '../../store'

const styles = theme => ({
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
    wordBreak: 'break-word',
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
})

const Course = ({
  classes, // UI
  course,
  activeCourseId,
  addingLink,
  setAddingLink,
  openCourseDialog,
  openConceptDialog,
  openConceptEditDialog,
  activeConceptIds,
  history,
  workspaceId
}) => {

  const { loggedIn } = useLoginStateValue()[0]

  const onHeaderClickHandle = () => {
    history.push(`/workspaces/${workspaceId}/mapper/${course.id}`)
  }

  return (
    <React.Fragment>
      <Card elevation={0} className={classes.root} id='masonry-element'>
        <CardHeader className={classes.cardHeader} title={
          <span className={classes.title} onClick={(onHeaderClickHandle)}>{course.name}</span>
        } action={
          loggedIn ?
            <IconButton onClick={openCourseDialog(course.id, course.name)}>
              <EditIcon />
            </IconButton>
            : null

        }>
        </CardHeader>

        <CardContent>
          <List className={classes.list}>
            {course.concepts.map(concept =>
              <Concept concept={concept}
                key={concept.id}
                course={course}
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
              <Button className={classes.button} onClick={openConceptDialog(course.id)} variant='contained' color='primary'> Add concept </Button>
              : null
          }

        </CardContent>
      </Card>
    </React.Fragment>
  )
}

export default withRouter(withStyles(styles)(Course))
