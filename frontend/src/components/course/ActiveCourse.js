import React, { useRef, useEffect } from 'react'
import { useMutation, useApolloClient } from 'react-apollo-hooks'
import { makeStyles } from '@material-ui/core/styles'

import { Button, Paper, FormControl, Select, MenuItem, InputLabel, List, IconButton } from '@material-ui/core'
import { Edit as EditIcon } from '@material-ui/icons'

import { DELETE_CONCEPT } from '../../graphql/Mutation'
import { COURSE_BY_ID } from '../../graphql/Query'

import ActiveConcept from '../concept/ActiveConcept'

import useCreateConceptDialog from './useCreateConceptDialog'
import useEditConceptDialog from './useEditConceptDialog'
import useEditCourseDialog from './useEditCourseDialog'

import { useLoginStateValue } from '../../store'
import { useInfoBox } from '../common/InfoBox'

const useStyles = makeStyles(theme => ({
  root: {
    gridArea: 'activeCourse',
    display: 'flex',
    flexDirection: 'column',
    padding: '16px',
    boxSizing: 'border-box'
  },
  title: {
    paddingBottom: '0px',
    maxWidth: '100%',
    overflowWrap: 'break-word',
    hyphens: 'auto',
    marginBottom: '16px'
  },
  list: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
    overflow: 'auto'
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
  },
  courseNavigationButton: {

  }
}))

const ActiveCourse = ({
  course,
  workspaceId,
  activeConceptIds,
  onClick,
  addingLink,
  setAddingLink,
  toggleConcept,
  courseLinks
}) => {
  const classes = useStyles()
  const infoBox = useInfoBox()
  const { loggedIn } = useLoginStateValue()[0]

  useEffect(() => {
    const hasLinks = course.concepts.find(concept => concept.linksToConcept.length > 0)
    const prereqConceptExists = courseLinks.find(link => link.from.concepts.length > 0)
    if (hasLinks && activeConceptIds.length === 0) {
      infoBox.open(activeConceptRef.current, 'right-start', 'FOCUS_CONCEPT', 0, 50)
    }
    if (hasLinks) return
    if (course.concepts.length === 0) {
      infoBox.open(createButtonRef.current, 'right-start', 'CREATE_CONCEPT_TARGET', 0, 50)
    }
    if (!prereqConceptExists) return
    if (courseLinks.length > 0 && !addingLink) {
      infoBox.open(conceptLinkRef.current, 'right-start', 'DRAW_LINK_START', 0, 20)
    }
  }, [course.concepts, addingLink, courseLinks])

  const {
    openCreateConceptDialog,
    ConceptCreateDialog
  } = useCreateConceptDialog(course, workspaceId, false)

  const {
    openEditConceptDialog,
    ConceptEditDialog
  } = useEditConceptDialog(course, workspaceId)

  const { openEditCourseDialog,
    CourseEditDialog
  } = useEditCourseDialog(workspaceId)

  const client = useApolloClient()

  const createButtonRef = useRef()
  const conceptLinkRef = useRef()
  const activeConceptRef = useRef()


  const includedIn = (set, object) =>
    set.map(p => p.id).includes(object.id)

  const deleteConcept = useMutation(DELETE_CONCEPT, {
    update: (store, response) => {
      const dataInStore = store.readQuery({
        query: COURSE_BY_ID,
        variables: {
          id: course.id
        }
      })

      const deletedConcept = response.data.deleteConcept
      const dataInStoreCopy = { ...dataInStore }
      const concepts = dataInStoreCopy.courseById.concepts
      if (includedIn(concepts, deletedConcept)) {
        dataInStoreCopy.courseById.concepts = concepts.filter(c => c.id !== deletedConcept.id)
        client.writeQuery({
          query: COURSE_BY_ID,
          variables: { id: course.id },
          data: dataInStoreCopy
        })
      }
    }
  })


  const handleCourseNavigationOpen = () => {

  }

  const handleCourseNavigationClose = () => {

  }

  const handleCourseNavigationChange = () => {

  }

  return <>
    <Paper onClick={onClick} elevation={0} className={classes.root}>
      <div
        className={'activeCourseHeaderContent'}
        style={{ display: 'flex', alignItems: 'center' }}
      >
        <form autoComplete='off' style={{ flex: '1 1 auto' }}>
          <Button className={classes.title} variant='h4'>
            {course.name}
          </Button>
          <FormControl className={classes.formControl}>
            <InputLabel htmlFor='select-course'>Course</InputLabel>
            <Select
              open={true}
              onClose={handleCourseNavigationClose}
              onOpen={handleCourseNavigationOpen}
              value={course.name}
              onChange={handleCourseNavigationChange}
              inputProps={{
                name: 'age',
                id: 'select-course'
              }}
            >
              <MenuItem value=''>
                <em>None</em>
              </MenuItem>
              <MenuItem value={'First'}>Course 1</MenuItem>
              <MenuItem value={'Second'}>Course 2</MenuItem>
              <MenuItem value={'Third'}>Course 3</MenuItem>
            </Select>
          </FormControl>

        </form>
        <div
          style={{
            flex: '0 0 auto',
            alignSelf: 'flex-start',
            marginTop: '-8px',
            marginRight: '-8px'
          }}
        >
          <IconButton onClick={openEditCourseDialog(course.id, course.name)}>
            <EditIcon />
          </IconButton>
        </div>
      </div>

      <List className={classes.list}>
        {course.concepts.map((concept, index) =>
          <ActiveConcept
            conceptLinkRef={index === 0 ? conceptLinkRef : undefined}
            activeConceptRef={index === 0 ? activeConceptRef : undefined}
            concept={concept}
            key={concept.id}
            activeConceptIds={activeConceptIds}
            addingLink={addingLink}
            setAddingLink={setAddingLink}
            deleteConcept={deleteConcept}
            openConceptEditDialog={openEditConceptDialog}
            toggleConcept={toggleConcept}
            workspaceId={workspaceId}
          />
        )}
      </List>

      {loggedIn ?
        <Button
          className={classes.button}
          onClick={openCreateConceptDialog(course.id)}
          variant='contained'
          color='secondary'
          ref={createButtonRef}
        >
          Add concept
        </Button> : null
      }
    </Paper>

    {/* Dialogs */}

    {CourseEditDialog}
    {ConceptCreateDialog}
    {ConceptEditDialog}
  </>
}

export default ActiveCourse
