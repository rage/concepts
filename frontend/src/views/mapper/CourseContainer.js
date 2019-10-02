import React, { useState, useEffect, useRef } from 'react'
import { useMutation } from 'react-apollo-hooks'

import { DELETE_CONCEPT_LINK, UPDATE_COURSE } from '../../graphql/Mutation'
import cache from '../../apollo/update'
import { useInfoBox } from '../../components/InfoBox'
import NotFoundView from '../error/NotFoundView'
import LoadingBar from '../../components/LoadingBar'
import PrerequisiteContainer from './PrerequisiteContainer'
import ActiveCourse from './ActiveCourse'
import MapperLinks from './MapperLinks'

const CourseContainer = ({
  courseId, workspaceId, urlPrefix, workspaceQuery, prereqQuery, courseQuery, courseTrayOpen
}) => {
  const [focusedConceptIds, setFocusedConceptIds] = useState(new Set())
  const [addingLink, setAddingLink] = useState(null)
  const [flashingLink, setFlashingLink] = useState(null)
  const flashLinkTimeout = useRef(0)
  const [conceptLinkMenu, setConceptLinkMenu] = useState(null)

  const flashLink = link => {
    if (focusedConceptIds.has(link.to.id) || focusedConceptIds.has(link.from.id)) {
      // Don't flash, link is active
      return
    }
    setFlashingLink(link.id)
    clearTimeout(flashLinkTimeout.current)
    flashLinkTimeout.current = setTimeout(() => setFlashingLink(null), 3000)
  }

  const infoBox = useInfoBox()

  useEffect(() => {
    infoBox.setView('mapper')
    return () => infoBox.unsetView('mapper')
  }, [infoBox])

  const updateCourse = useMutation(UPDATE_COURSE, {
    update: cache.updateCourseUpdate(workspaceId)
  })

  const handleMenuOpen = (event, linkId) => {
    event.preventDefault()
    setConceptLinkMenu({
      x: event.pageX + window.pageXOffset,
      y: event.pageY + 32 + window.pageYOffset,
      linkId
    })
  }

  const deleteConceptLink = useMutation(DELETE_CONCEPT_LINK, {
    update: cache.deleteConceptLinkUpdate(courseId)
  })

  const handleMenuClose = () => {
    setConceptLinkMenu(null)
  }

  const deleteLink = async () => {
    await deleteConceptLink({
      variables: {
        id: conceptLinkMenu.linkId
      }
    })
    setConceptLinkMenu(null)
  }

  const toggleFocus = id => {
    const newFocusedConceptIds = new Set(focusedConceptIds)
    if (newFocusedConceptIds.has(id)) {
      newFocusedConceptIds.delete(id)
    } else {
      newFocusedConceptIds.add(id)
    }
    setFocusedConceptIds(newFocusedConceptIds)
  }

  if (workspaceQuery.error) {
    return <NotFoundView message='Workspace not found' />
  } else if (courseQuery.error) {
    return <NotFoundView message='Course not found' />
  } else if (!prereqQuery.data.courseAndPrerequisites || !courseQuery.data.courseById
    || !workspaceQuery.data.workspaceById) {
    return <LoadingBar id='course-view' />
  }

  const courseSet = new Set(prereqQuery.data.courseAndPrerequisites?.linksToCourse
    .map(link => link.from.id))

  return <>
    <PrerequisiteContainer
      courseLinks={prereqQuery.data.courseAndPrerequisites.linksToCourse}
      courseId={courseQuery.data.courseById.id}
      focusedConceptIds={focusedConceptIds}
      addingLink={addingLink}
      setAddingLink={setAddingLink}
      flashLink={flashLink}
      toggleFocus={toggleFocus}
      courseTrayOpen={courseTrayOpen}
      workspaceId={workspaceQuery.data.workspaceById.id}
      urlPrefix={urlPrefix}
    />
    <ActiveCourse
      onClick={() => setAddingLink(null)}
      course={courseQuery.data.courseById}
      courses={workspaceQuery.data.workspaceById.courses}
      updateCourse={updateCourse}
      focusedConceptIds={focusedConceptIds}
      addingLink={addingLink}
      setAddingLink={setAddingLink}
      flashLink={flashLink}
      toggleFocus={toggleFocus}
      courseTrayOpen={courseTrayOpen}
      workspaceId={workspaceQuery.data.workspaceById.id}
      urlPrefix={urlPrefix}
    />
    <MapperLinks
      flashingLink={flashingLink} addingLink={addingLink} courseId={courseId}
      focusedConceptIds={focusedConceptIds} conceptLinkMenu={conceptLinkMenu} courseSet={courseSet}
      handleMenuOpen={handleMenuOpen} handleMenuClose={handleMenuClose} deleteLink={deleteLink}
    />
  </>
}

export default CourseContainer
