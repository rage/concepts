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


import Concept from '../concept/Concept'

const styles = theme => ({
  root: {
    width: '280px',
    margin: '0px 8px 16px 8px'
  },
  list: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
    paddingBottom: theme.spacing.unit * 2,
    position: 'relative',
    overflow: 'auto',
    maxHeight: 300,
  },
  cardHeader: {
    paddingBottom: '0px'
  },
  title: {
    wordBreak: 'break-word'
  },
  listSection: {
    backgroundColor: 'inherit',
  },
  ul: {
    backgroundColor: 'inherit',
    padding: 0,
  },
  highlight: {
    backgroundColor: 'cyan'
  },
  button: {
    width: '100%'
  }
});

const Course = ({
  classes, // UI
  course,
  activeCourseId,
  openCourseDialog,
  openConceptDialog,
  openConceptEditDialog,
  activeConceptIds
}) => {
  return (
    <React.Fragment>
      <Card elevation={0} className={classes.root} id='masonry-element'>
        <CardHeader className={classes.cardHeader} classes={{ title: classes.title }} title={course.name} action={
          <IconButton onClick={openCourseDialog(course.id, course.name)}>
            <EditIcon />
          </IconButton>
        }>
        </CardHeader>

        <CardContent>
          <List className={classes.list}>
            {course.concepts.map(concept =>
              <Concept concept={concept}
                key={concept.id}
                course={course}
                activeConceptIds={activeConceptIds}
                openConceptEditDialog={openConceptEditDialog}
                activeCourseId={activeCourseId}
              />
            )}
          </List>
          <Button className={classes.button} onClick={openConceptDialog(course.id)} variant="contained" color="primary"> Add concept </Button>
        </CardContent>
      </Card>
    </React.Fragment>
  )
}

export default withStyles(styles)(Course);