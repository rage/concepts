import React, { useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import { Button, Card, CardHeader, CardContent, List, IconButton } from '@material-ui/core'
import {
  Edit as EditIcon,
  Lock as LockedIcon,
  LockOpen as LockOpenIcon
} from '@material-ui/icons'
import { useMutation } from 'react-apollo-hooks'

import { Concept } from './concept'
import { useLoginStateValue, useMessageStateValue } from '../../store'
import { useCreateConceptDialog } from '../../dialogs/concept'
import { useEditCourseDialog } from '../../dialogs/course'
import { UPDATE_COURSE_LINK } from '../../graphql/Mutation'
import cache from '../../apollo/update'
import { useInfoBox } from '../../components/InfoBox'

const useStyles = makeStyles(theme => ({
  root: {
    margin: '0px 8px 16px 8px',
    width: '100%'
  },
  list: {
    width: '100%',
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
  courseLink,
  connectionRef,
  createConceptRef,
  activeCourseId,
  addingLink,
  setAddingLink,
  toggleFocus,
  focusedConceptIds,
  history,
  workspaceId,
  urlPrefix
}) => {
  const { user, loggedIn } = useLoginStateValue()[0]
  const classes = useStyles()
  const [, messageDispatch] = useMessageStateValue()
  const openCreateConceptDialog = useCreateConceptDialog(workspaceId, user.role === 'STAFF')
  const openEditCourseDialog = useEditCourseDialog(workspaceId, user.role === 'STAFF')
  const course = courseLink.from
  const updateCourseLink = useMutation(UPDATE_COURSE_LINK, {
    update: cache.updateCourseLinkUpdate(workspaceId, activeCourseId)
  })

  const onHeaderClickHandle = () => {
    history.push(`${urlPrefix}/${workspaceId}/mapper/${course.id}`)
  }

  const setCourseLinkFrozen = async (frozen) => {
    await updateCourseLink({ variables: { id: courseLink.id, frozen } })
      .catch(() => messageDispatch({
        type: 'setError',
        data: 'Access denied'
      }))
  }

  const infoBox = useInfoBox()

  useEffect(() => {
    infoBox.current.redrawIfOpen('mapper', 'CREATE_CONCEPT_PREREQ')
  }, [course.concepts])

  return (
    <Card elevation={0} className={classes.root}>
      <CardHeader
        className={classes.cardHeader}
        title={
          <span className={classes.title} onClick={(onHeaderClickHandle)}>{course.name}</span>
        }
        action={<>
          {(user.role === 'STAFF' || courseLink.frozen) &&
            <IconButton
              disabled={user.role !== 'STAFF'}
              onClick={() => setCourseLinkFrozen(!courseLink.frozen)}
            >
              {courseLink.frozen ? <LockedIcon /> : <LockOpenIcon />}
            </IconButton>
          }
          <IconButton disabled={!loggedIn || (course.frozen && user.role !== 'STAFF')}
            onClick={() => openEditCourseDialog(course.id, course.name,
              course.official, course.frozen)}>
            <EditIcon />
          </IconButton>
          </>
        }>
      </CardHeader>

      <CardContent>
        <List className={classes.list}>
          {course.concepts.map((concept, index) =>
            <Concept concept={concept}
              key={concept.id}
              course={course}
              connectionRef={index === 0 ? connectionRef : undefined}
              addingLink={addingLink}
              setAddingLink={setAddingLink}
              toggleFocus={toggleFocus}
              focusedConceptIds={focusedConceptIds}
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
