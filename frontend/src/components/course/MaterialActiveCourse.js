import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'

// Card
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';

// List 
import List from '@material-ui/core/List';

// Icons
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';


import MaterialActiveConcept from '../concept/MaterialActiveConcept'

const styles = theme => ({
  root: {
    width: '270px',
    marginLeft: '10px'
  },
  list: {
    // width: '100%',
    // maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
    paddingBottom: theme.spacing.unit * 2,
    // position: 'relative',
    // overflow: 'auto',
    maxHeight: 500,
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

const MaterialActiveCourse = ({
  classes, // MaterialUI
  course,
  openConceptDialog,
  openConceptEditDialog,
  activateConcept,
  activeConceptId,
  deleteConcept
}) => {
  return (
    <div>
      <Card elevation={3} className={classes.root}>
        <CardHeader className={classes.cardHeader} title={course.name}>
        </CardHeader>

        <CardContent>
          <List className={classes.list}>
            {course.concepts.map(concept =>
              <MaterialActiveConcept concept={concept}
                key={concept.id}
                activateConcept={activateConcept}
                activeConceptId={activeConceptId}
                deleteConcept={deleteConcept}
                openConceptEditDialog={openConceptEditDialog}
              />
            )}
          </List>

          {/* <Button
            className={classes.button}
            onClick={openConceptDialog(course.id)}
            variant="contained"
            color="primary"
          >
            Add concept
          </Button> */}
        </CardContent>
      </Card>
    </div>
  )
}

export default withStyles(styles)(MaterialActiveCourse)