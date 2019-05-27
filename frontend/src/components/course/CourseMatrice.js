import React, { useState } from 'react'
import { withStyles, makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";

import { FixedSizeGrid } from 'react-window';
import Grid from '@material-ui/core/Grid'



const styles = theme => {
}

const CourseMatrice = ({ classes, course, prerequisiteCourses }) => {

  const allPrerequisiteConcepts = prerequisiteCourses.map(course => course.concepts).reduce((concepts, allConcepts) => {
    return allConcepts.concat(concepts)
  }, [])

  const createConceptRow = (concept, prerequisites) => {
    return prerequisites.map(p => {
      return {
        id: p.id,
        isPrerequisite: p.linksFromConcept.map(l => l.to.id).includes(concept.id)
      }
    })
  }

  const headerGrid = React.createRef();
  const sideGrid = React.createRef()



  
  console.log(allPrerequisiteConcepts)

  const columnCount = allPrerequisiteConcepts.length;
  const rowCount = course.concepts.length;
  const columnWidth = 100;
  const rowHeight = 40;

  const HeaderCell = ({ columnIndex, rowIndex, style }) => (
    <div style={style}>
      { allPrerequisiteConcepts[columnIndex].name }
    </div>
  );
  
  const RowHeaderCell = ({ columnIndex, rowIndex, style }) => (
    <div style={style}>
      { course.concepts[rowIndex].name }
      
    </div>
  );
  
  const Cell = ({ columnIndex, rowIndex, style }) => (
    <div style={style}>
      Item {rowIndex},{columnIndex}
    </div>
  );
  

  console.log(course)
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