import React, { useState } from 'react'
import { withStyles, makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";

import { FixedSizeGrid } from 'react-window';
import Checkbox from '@material-ui/core/Checkbox'
import Grid from '@material-ui/core/Grid'

import { useMutation, useApolloClient, useQuery } from 'react-apollo-hooks'
import { DELETE_CONCEPT, LINK_PREREQUISITE, DELETE_LINK} from '../../services/ConceptService'
import { COURSE_PREREQUISITE_COURSES, ALL_COURSES } from '../../services/CourseService'

const styles = theme => {
}

const CourseMatrice = ({ classes, course, prerequisiteCourses }) => {

  const allPrerequisiteConcepts = prerequisiteCourses.map(course => course.concepts).reduce((concepts, allConcepts) => {
    return allConcepts.concat(concepts)
  }, [])

  const client = useApolloClient()

  const headerGrid = React.createRef();
  const sideGrid = React.createRef()

  const columnCount = allPrerequisiteConcepts.length;
  const rowCount = course.concepts.length;
  const columnWidth = 100;
  const rowHeight = 40;

  const HeaderCell = ({ columnIndex, data, style }) => (
    <div style={style}>
      { data[columnIndex].name }
    </div>
  );
  
  const RowHeaderCell = ({ data, rowIndex, style }) => (
    <div style={style}>
      { data[rowIndex].name }
    </div>
  );

  const deleteLink = useMutation(DELETE_LINK, {
    update: (store, response) => {
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
    }
  })

  const linkPrerequisite = useMutation(LINK_PREREQUISITE, {
    update: (store, response) => {
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
    }
  })

  const linkConcepts = (from, to) => async (event) => {
    if (event.target.checked) {
      await linkPrerequisite({
        variables: {
          from: from.id, to: to.id
        }
      })
    } else {
      const link = from.linksFromConcept.find(link => {
        return link.to.id === to.id
      })
      await deleteLink({
        variables: {
          id: link.id
        }
      })
    }


    
  }

  const Cell = ({ columnIndex, data, rowIndex, style }) => {
    const {columnData, rowData } = data
    const isPrerequisite = columnData[columnIndex].linksFromConcept.find(l => l.to.id === rowData[rowIndex].id)
    let checked = isPrerequisite !== undefined
    return (
      <div style={style}>
          <Checkbox 
          onClick={
            linkConcepts(columnData[columnIndex], rowData[rowIndex], checked)
          }
          checked={checked}
          />
      </div>
  )}
  
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
          height={40}
          width={600}
          // hold onto a reference to the header grid component
          // so we can set the scroll position later
          ref={headerGrid}
          // hide the overflow so the scroll bar never shows
          // in the header grid
          style={{
            overflowX: 'hidden',
            overflowY: 'hidden',
            backgroundColor: 'lightgray',
            borderBottom: `1px solid gray`,
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
          rowHeight={40}
          height={560}
          width={214}
          // hold onto a reference to the header grid component
          // so we can set the scroll position later
          ref={sideGrid}
          // hide the overflow so the scroll bar never shows
          // in the header grid
          style={{
            overflowX: 'hidden',
            overflowY: 'hidden',
            backgroundColor: 'lightgray',
            borderBottom: `1px solid gray`,
          }}
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
          height={560}
          width={600}
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
  // return (
  //   <Paper>
  //     <Table>
  //       <TableHead>
  //         <TableRow>
  //           <TableCell>

  //           </TableCell>
  //           {
  //             allPrerequisiteConcepts.map(concept => (
  //               <TableCell key={concept.id}>
  //                 { concept.name }
  //               </TableCell>
  //             ))
  //           }
  //         </TableRow>
  //       </TableHead>

  //       <TableBody>
  //         {course.concepts.map(concept => (
  //             <TableRow key={concept.id}>
  //               <TableCell> {concept.name } </TableCell>
  //               {
  //                 createConceptRow(concept, allPrerequisiteConcepts).map(concept => (
  //                   <TableCell key={concept.id}>
  //                     {concept.isPrerequisite ? 'X' : ''}
  //                   </TableCell>
  //                 ))
  //               }
  //             </TableRow>
  //           )
  //           )
  //           }
  //       </TableBody>
  //     </Table>
  //   </Paper>
  // )
}

export default CourseMatrice