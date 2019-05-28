import React from 'react'
import { withStyles } from "@material-ui/core/styles";

import { FixedSizeGrid } from 'react-window';
import Checkbox from '@material-ui/core/Checkbox'
import Grid from '@material-ui/core/Grid'

import { useMutation, useApolloClient } from 'react-apollo-hooks'
import { LINK_PREREQUISITE, DELETE_LINK } from '../../services/ConceptService'
import { COURSE_PREREQUISITE_COURSES } from '../../services/CourseService'

const styles = theme => ({
  active: {
    backgroundColor: '#9ecae1',
    "&:hover": {
      backgroundColor: '#9ecae1'
    },
    "&:focus": {
      backgroundColor: '#9ecae1'
    }
  },
  inactive: {
    backgroundColor: '#fff',
    "&:focus": {
      backgroundColor: '#fff'
    }
  }
})


const CourseMatrice = ({ classes, course, prerequisiteCourses, dimensions }) => {
  const allPrerequisiteConcepts = prerequisiteCourses.map(course => course.concepts).reduce((concepts, allConcepts) => {
    return allConcepts.concat(concepts)
  }, [])

  const client = useApolloClient()

  const headerGrid = React.createRef();
  const sideGrid = React.createRef()

  const columnCount = allPrerequisiteConcepts.length;
  const rowCount = course.concepts.length;
  const columnWidth = 100;
  const rowHeight = 70;

  const HeaderCell = ({ columnIndex, data, style }) => (
    <div style={style}>
      <div style={{
      transform: 'translate(0px, 51px) rotate(315deg)',
      width: '150px',
      textOverflow: 'ellipsis'
    }}>
        <span style={{overflow: 'hidden', maxWidth:'3ch'}}>
          {data[columnIndex].name}
        </span>
      </div >
    </div>
  );

  const RowHeaderCell = ({ data, rowIndex, style }) => (
    <div style={style}>
      <div style={{
        margin: '12px 20px 0px 0px',
        width: '200px'
      }}>
        {data[rowIndex].name}
      </div>
    </div>
  );

  const deleteLink = useMutation(DELETE_LINK, {
    update: (store, response) => {
      try {
        const dataInStore = store.readQuery({ query: COURSE_PREREQUISITE_COURSES, variables: { id: course.id } })
        const deletedLink = response.data.deleteLink
        const dataInStoreCopy = { ...dataInStore }
        dataInStoreCopy.courseById.prerequisiteCourses.forEach(courseForConcept => {
          courseForConcept.concepts.forEach(concept => {
            concept.linksFromConcept = concept.linksFromConcept.filter(l => l.id !== deletedLink.id)
          })
        })
        client.writeQuery({
          query: COURSE_PREREQUISITE_COURSES,
          variables: { id: course.id },
          data: dataInStoreCopy
        })
      } catch (err) { }
    }
  })

  const linkPrerequisite = useMutation(LINK_PREREQUISITE, {
    update: (store, response) => {
      try {
        const dataInStore = store.readQuery({ query: COURSE_PREREQUISITE_COURSES, variables: { id: course.id } })
        const addedLink = response.data.createLink
        const dataInStoreCopy = { ...dataInStore }
        dataInStoreCopy.courseById.prerequisiteCourses.forEach(courseForConcept => {
          const concept = courseForConcept.concepts.find(c => c.id === addedLink.from.id)
          if (concept) {
            concept.linksFromConcept.push(addedLink)
          }
        })
        client.writeQuery({
          query: COURSE_PREREQUISITE_COURSES,
          variables: { id: course.id },
          data: dataInStoreCopy
        })
      } catch (err) { }
    }
  })

  const linkConcepts = (from, to) => async (event) => {
    if (event.target.checked) {
      try {
        linkPrerequisite({
          variables: {
            from: from.id, to: to.id
          }
        })
      } catch (err) { }
    } else {
      try {
        const link = from.linksFromConcept.find(link => {
          return link.to.id === to.id
        })
        deleteLink({
          variables: {
            id: link.id
          }
        })
      } catch (err) { }
    }
  }

  const Cell = ({ columnIndex, data, rowIndex, style }) => {
    const { columnData, rowData } = data
    const isPrerequisite = columnData[columnIndex].linksFromConcept.find(l => l.to.id === rowData[rowIndex].id)
    let checked = isPrerequisite !== undefined
    return (
      <div style={style} key={`${rowData[rowIndex].id}-${columnIndex}-${columnData[columnIndex]}`}>
        <Checkbox
          onClick={
            linkConcepts(columnData[columnIndex], rowData[rowIndex])
          }
          defaultChecked={checked}
        />
      </div>
    )
  }

  return (
    <Grid container direction='row'>
      <Grid item xs={2}>
        <div>
        </div>
      </Grid>

      <Grid item xs={10}>
        <FixedSizeGrid
          id='headerGrid'
          // standard grid setup for the header grid
          columnCount={columnCount}
          rowCount={1}
          columnWidth={columnWidth}
          rowHeight={rowHeight}
          height={160}
          width={dimensions.width - 230}
          // hold onto a reference to the header grid component
          // so we can set the scroll position later
          ref={headerGrid}
          // hide the overflow so the scroll bar never shows
          // in the header grid
          style={{
            overflowX: 'hidden',
            overflowY: 'hidden',
            // borderBottom: `1px solid gray`,
          }}
          itemData={allPrerequisiteConcepts}
        >
          {HeaderCell}
        </FixedSizeGrid>
      </Grid>

      <Grid item xs={2}>
        <FixedSizeGrid
          id='sideGrid'
          // standard grid setup for the header grid
          columnCount={1}
          rowCount={rowCount}
          columnWidth={columnWidth}
          rowHeight={rowHeight}
          height={dimensions.height - 160}
          width={214}
          // hold onto a reference to the header grid component
          // so we can set the scroll position later
          ref={sideGrid}
          // hide the overflow so the scroll bar never shows
          // in the header grid
          style={{
            overflowX: 'hidden',
            overflowY: 'hidden',
            // backgroundColor: 'lightgray',
            // borderBottom: `1px solid gray`,
          }}
          direction='rtl'
          itemData={course.concepts}
        >
          {RowHeaderCell}
        </FixedSizeGrid>
      </Grid>

      <Grid item xs={10}>
        <FixedSizeGrid
          // standard grid setup for the body grid
          columnCount={columnCount}
          rowCount={rowCount}
          columnWidth={columnWidth}
          rowHeight={rowHeight}
          height={dimensions.height - 160}
          width={dimensions.width - 230}
          // When a scroll occurs in the body grid,
          // synchronize the scroll position of the header grid
          onScroll={({ scrollLeft, scrollTop }) => {
            headerGrid.current.scrollTo({ scrollLeft })
            sideGrid.current.scrollTo({ scrollTop })
          }}
          itemData={{
            columnData: allPrerequisiteConcepts,
            rowData: course.concepts
          }}
        >
          {Cell}
        </FixedSizeGrid>
      </Grid>
    </Grid>
  )
}

export default withStyles(styles)(CourseMatrice)