import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'

// Card
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';

// List 
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';

//
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import ShareIcon from '@material-ui/icons/Share';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MoreVertIcon from '@material-ui/icons/MoreVert';

// 
import MaterialConcept from '../concept/MaterialConcept'

const styles = theme => ({
  root: {
    width: '270px'
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

const MaterialCourse = ({ classes, // MaterialUI
                          course, linkPrerequisite, activeConceptId, deleteLink, createConcept }) => {


  return (
    <div>
      <Card className={classes.root}>
        <CardHeader className={classes.cardHeader} title={course.name} action={
            <IconButton>
              <EditIcon />
            </IconButton>
          }>
        </CardHeader>

        <CardContent>
          <List className={classes.list}>
          {course.concepts.map(concept =>
            <MaterialConcept concept={concept}
            key={concept.id}
            linkPrerequisite={linkPrerequisite}
            deleteLink={deleteLink}
            activeConceptId={activeConceptId}/>
      )}
          </List>
          <Button className={classes.button} variant="contained" color="primary"> Add concept </Button>
        </CardContent>

        
      </Card>
    </div>
  )
}

export default withStyles(styles)(MaterialCourse);