import React, {useEffect, useMemo} from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Button, Card, CardHeader, CardContent, List, IconButton } from '@material-ui/core'
import {
  Edit as EditIcon, Lock as LockedIcon, LockOpen as LockOpenIcon,
  KeyboardArrowUp as CollapseIcon, KeyboardArrowDown as ExpandIcon
} from '@material-ui/icons'
import { useMutation } from 'react-apollo-hooks'

import { Role } from '../../lib/permissions'
import { Concept } from './concept'
import { useLoginStateValue, useMessageStateValue } from '../../lib/store'
import { useCreateConceptDialog } from '../../dialogs/concept'
import { useEditCourseDialog } from '../../dialogs/course'
import { UPDATE_COURSE_LINK } from '../../graphql/Mutation'
import cache from '../../apollo/update'
import { useInfoBox } from '../../components/InfoBox'
import useRouter from '../../lib/useRouter'
import {sortedConcepts} from '../manager/ordering'

const useStyles = makeStyles(theme => ({
  root: {
    margin: '0px 8px 16px 8px',
    width: '100%'
  },
  list: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
    paddingBottom: theme.spacing(2),
    paddingTop: 0,
    position: 'relative'
  },
  cardHeader: {
    paddingBottom: '0px'
  },
  title: {
    overflowWrap: 'anywhere',
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
  },
  collapser: {
    display: 'flex',
    justifyContent: 'space-around',
    width: '100%',
    borderRadius: 0,
    marginBottom: '6px'
  },
  content: {
    paddingTop: 0
  }
}))

const Course = ({
  courseLink,
  connectionRef,
  createConceptRef,
  prereqFreezeRef,
  activeCourseId,
  addingLink,
  setAddingLink,
  flashLink,
  toggleFocus,
  focusedConceptIds,
  collapsedCourseIds,
  toggleCollapse,
  workspaceId,
  urlPrefix
}) => {
  const classes = useStyles()
  const { history } = useRouter()

  const [{ user }] = useLoginStateValue()
  const [, messageDispatch] = useMessageStateValue()

  const openCreateConceptDialog = useCreateConceptDialog(workspaceId, user.role >= Role.STAFF)
  const openEditCourseDialog = useEditCourseDialog(workspaceId, user.role >= Role.STAFF)
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
    infoBox.redrawIfOpen('mapper', 'CREATE_CONCEPT_PREREQ')
  }, [infoBox, course.concepts])

  const collapsed = collapsedCourseIds.has(course.id)

  const orderedConcepts = useMemo(() => sortedConcepts(course),
    [course, course.concepts, course.conceptOrder])

  return (
    <Card elevation={0} className={classes.root}>
      <CardHeader
        className={`${classes.cardHeader} focusOverlayScrollParent`}
        title={<span className={classes.title} onClick={(onHeaderClickHandle)}>{course.name}</span>}
        action={<>
          {(user.role >= Role.STAFF || courseLink.frozen) &&
            <IconButton
              disabled={user.role < Role.STAFF}
              onClick={() => setCourseLinkFrozen(!courseLink.frozen)}
              ref={prereqFreezeRef}
            >
              {courseLink.frozen ? <LockedIcon /> : <LockOpenIcon />}
            </IconButton>
          }
          <IconButton disabled={course.frozen && user.role < Role.STAFF}
            onClick={() => openEditCourseDialog(course)}>
            <EditIcon />
          </IconButton>
        </>}>
      </CardHeader>
      <Button className={classes.collapser} onClick={() => toggleCollapse(course.id)}>
        {collapsed ? <ExpandIcon /> : <CollapseIcon />}
      </Button>

      {!collapsed && <CardContent className={classes.content}>
        <List className={classes.list}>
          {orderedConcepts.map((concept, index) =>
            <Concept concept={concept}
              key={concept.id}
              course={course}
              connectionRef={index === 0 ? connectionRef : undefined}
              addingLink={addingLink}
              setAddingLink={setAddingLink}
              flashLink={flashLink}
              toggleFocus={toggleFocus}
              focusedConceptIds={focusedConceptIds}
              activeCourseId={activeCourseId}
              workspaceId={workspaceId}
            />
          )}
        </List>
        <Button
          className={`${classes.button} focusOverlayScrollParent`}
          onClick={() => openCreateConceptDialog(course.id)}
          variant='contained'
          color='primary'
          ref={createConceptRef}
        >
          Add concept
        </Button>
      </CardContent>}
    </Card>
  )
}

export default React.memo(Course)
