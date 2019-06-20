import React, { useState } from 'react'
import { withStyles } from "@material-ui/core/styles";

import { FixedSizeGrid } from 'react-window';

import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'

import { useMutation, useApolloClient } from 'react-apollo-hooks'
import { LINK_PREREQUISITE, DELETE_LINK } from '../../graphql/ConceptService'
import { COURSE_PREREQUISITE_COURSES } from '../../graphql/CourseService'

const styles = theme => ({
  cellButton: {
    width: '90%'
  },
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


const GridCell = ({ classes, onClick, checked, onHover, onMouseLeave }) => (
  <Button className={classes.cellButton} onMouseOver={onHover} onMouseLeave={onMouseLeave} onClick={onClick} variant="contained" color={checked ? "primary" : "secondary"}> {checked ? 'LINKED' : 'UNLINKED'} </Button>
)

const CourseMatrix = ({ classes, course, prerequisiteCourses, dimensions }) => {
  const allPrerequisiteConcepts = prerequisiteCourses.map(course => course.concepts).reduce((concepts, allConcepts) => {
    return allConcepts.concat(concepts)
  }, [])

  const client = useApolloClient()

  const headerGrid = React.createRef();
  const sideGrid = React.createRef()

  const rowCount = course.concepts.length;
  const columnWidth = 110;
  const rowHeight = 70;

  const headerHeight = 160;
  const sideHeaderWidth = 250
  const height = 470

  const [selectedRow, setSelectedRow] = useState(-1)
  const [selectedColumn, setSelectedColumn] = useState(-1)

  const [filter, setFilter] = useState('')

  const HeaderCell = ({ columnIndex, data, style }) => (
    <div style={style}>
      <div style={{
        transform: 'translate(0px, 51px) rotate(315deg)',
        width: '150px',
        textOverflow: 'ellipsis',
        color: columnIndex !== selectedColumn ? 'grey' : 'black'
      }}>
        <span style={{ overflow: 'hidden', maxWidth: '3ch' }}>
          {data[columnIndex].name}
        </span>
      </div >
    </div>
  );

  const RowHeaderCell = ({ data, rowIndex, style }) => (
    <div style={style}>
      <div style={{
        margin: '12px 20px 0px 0px',
        width: '200px',
        color: rowIndex !== selectedRow ? 'grey' : 'black'
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

  const linkConcepts = (from, to, checked) => async (event) => {

    if (!checked) {
      try {
        linkPrerequisite({
          variables: {
            from: from.id, to: to.id
          },
          optimisticResponse: {
            __typename: "Mutation",
            createLink: {
              id: `${Math.random() * 100}`,
              __typename: "Link",
              to: {
                __typename: "Concept",
                id: to.id
              },
              from: {
                __typename: "Link",
                id: from.id
              }
            }
          },
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
          },
          optimisticResponse: {
            __typename: "Mutation",
            deleteLink: {
              id: link.id,
              __typename: "Link"
            }
          },
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
        <GridCell
          classes={classes}
          onClick={
            linkConcepts(columnData[columnIndex], rowData[rowIndex], checked)
          }
          onHover={
            () => {
              setSelectedColumn(columnIndex)
              setSelectedRow(rowIndex)
            }
          }
          onMouseLeave={
            () => {
              setSelectedColumn(-1)
              setSelectedRow(-1)
            }

          }

          checked={checked}
        />
      </div>
    )
  }


  const filteredPrerequisiteConcepts = () => {
    let filteredConcepts = allPrerequisiteConcepts.filter(c =>
      c.name.toLowerCase().includes(filter)
    )
    return filteredConcepts
  }

  return (
    <Grid container direction='row'>
      <Grid item xs={4} lg={3} xl={2}>
        <div style={{ padding: '20px' }}>
          <form onSubmit={(e) => {
            e.preventDefault()
            setFilter(e.target.filter.value.toLowerCase())
          }} >
            <TextField
              margin="dense"
              id="description"
              label="Filter"
              type="text"
              name="filter"
              fullWidth
              variant="outlined"
            />
            <Button variant="contained" type="submit" fullWidth> Filter </Button>
          </form>
        </div>
      </Grid>

      <Grid item xs={8} lg={9} xl={10}>
        <FixedSizeGrid
          id='headerGrid'
          // standard grid setup for the header grid
          columnCount={filteredPrerequisiteConcepts().length}
          rowCount={1}
          columnWidth={columnWidth}
          rowHeight={rowHeight}
          height={headerHeight}
          width={dimensions.width - 120}
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
          itemData={filteredPrerequisiteConcepts()}
        >
          {HeaderCell}
        </FixedSizeGrid>
      </Grid>

      <Grid item xs={4} lg={3} xl={2}>
        <FixedSizeGrid
          id='sideGrid'
          // standard grid setup for the header grid
          columnCount={1}
          rowCount={rowCount}
          columnWidth={columnWidth}
          rowHeight={rowHeight}
          height={height}
          width={sideHeaderWidth}
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

      <Grid item xs={8} lg={9} xl={10}>
        <FixedSizeGrid
          // standard grid setup for the body grid
          columnCount={filteredPrerequisiteConcepts().length}
          rowCount={rowCount}
          columnWidth={columnWidth}
          rowHeight={rowHeight}
          height={height}
          width={dimensions.width - 120}
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

export default withStyles(styles)(CourseMatrix)