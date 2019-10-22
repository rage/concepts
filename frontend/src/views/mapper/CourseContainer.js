import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useMutation } from 'react-apollo-hooks'

import { DELETE_CONCEPT_LINK, UPDATE_COURSE } from '../../graphql/Mutation'
import cache from '../../apollo/update'
import { useInfoBox } from '../../components/InfoBox'
import PrerequisiteContainer from './PrerequisiteContainer'
import ActiveCourse from './ActiveCourse'
import MapperLinks from './MapperLinks'

const CourseContainer = ({
  urlPrefix, workspace, course, courseLinkMap, courseLinks, courseTrayOpen
}) => {
  const [focusedConceptIds, setFocusedConceptIds] = useState(new Set())
  const [collapsedCourseIds, setCollapsedCourseIds] = useState(new Set())
  const [addingLink, setAddingLink] = useState(null)
  const [flashingLink, setFlashingLink] = useState(null)
  const flashLinkTimeout = useRef(0)
  const [conceptLinkMenu, setConceptLinkMenu] = useState(null)

  const flashLink = useCallback(link => {
    if (focusedConceptIds.has(link.to.id) || focusedConceptIds.has(link.from.id)) {
      // Don't flash, link is active
      return
    }
    setFlashingLink(link.id)
    clearTimeout(flashLinkTimeout.current)
    flashLinkTimeout.current = setTimeout(() => setFlashingLink(null), 3000)
  }, [focusedConceptIds, flashLinkTimeout])

  const infoBox = useInfoBox()

  useEffect(() => {
    infoBox.setView('mapper')
    return () => infoBox.unsetView('mapper')
  }, [infoBox])

  const updateCourse = useMutation(UPDATE_COURSE, {
    update: cache.updateCourseUpdate(workspace.id)
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
    update: cache.deleteConceptLinkUpdate(course.id)
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

  const toggleFocus = useCallback(id => {
    const newFocusedConceptIds = new Set(focusedConceptIds)
    if (newFocusedConceptIds.has(id)) {
      newFocusedConceptIds.delete(id)
    } else {
      newFocusedConceptIds.add(id)
    }
    setFocusedConceptIds(newFocusedConceptIds)
  }, [focusedConceptIds])

  const toggleCollapse = useCallback(id => {
    const newCollapsedCourseIds = new Set(collapsedCourseIds)
    if (newCollapsedCourseIds.has(id)) {
      newCollapsedCourseIds.delete(id)
    } else {
      newCollapsedCourseIds.add(id)
    }
    setCollapsedCourseIds(newCollapsedCourseIds)
    setTimeout(() => window.dispatchEvent(new CustomEvent('redrawConceptLink')), 0)
  }, [collapsedCourseIds])

  return <>
    {addingLink && <style>{`
      .${addingLink.oppositeType}:not(.linkto-${addingLink.id}) {
        color: #f50057;
      }
    `}</style>}
    <PrerequisiteContainer
      courseLinks={courseLinks}
      courseId={course.id}
      focusedConceptIds={focusedConceptIds}
      collapsedCourseIds={collapsedCourseIds}
      toggleCollapse={toggleCollapse}
      addingLink={addingLink}
      setAddingLink={setAddingLink}
      flashLink={flashLink}
      toggleFocus={toggleFocus}
      courseTrayOpen={courseTrayOpen}
      workspaceId={workspace.id}
      urlPrefix={urlPrefix}
    />
    <ActiveCourse
      course={course}
      courses={workspace.courses}
      updateCourse={updateCourse}
      focusedConceptIds={focusedConceptIds}
      addingLink={addingLink}
      setAddingLink={setAddingLink}
      flashLink={flashLink}
      toggleFocus={toggleFocus}
      courseTrayOpen={courseTrayOpen}
      workspaceId={workspace.id}
      urlPrefix={urlPrefix}
    />
    <MapperLinks
      flashingLink={flashingLink} addingLink={addingLink} courseId={course.id}
      focusedConceptIds={focusedConceptIds} conceptLinkMenu={conceptLinkMenu}
      courseLinkMap={courseLinkMap} collapsedCourseIds={collapsedCourseIds}
      handleMenuOpen={handleMenuOpen} handleMenuClose={handleMenuClose} deleteLink={deleteLink}
    />
  </>
}

export default CourseContainer
