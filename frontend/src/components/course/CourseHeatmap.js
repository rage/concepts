import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'

import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'

import { useQuery } from 'react-apollo-hooks'
import {
  WORKSPACE_COURSES_AND_CONCEPTS
} from '../../graphql/Query'

import './heatmap.css'

const cellDimension = {
  width: 50,
  height: 50
}

const useStyles = makeStyles(theme => ({
  tableCell: {
    width: `${cellDimension.width}px`,
    height: `${cellDimension.height}px`,
    border: "1px solid #fff"
  },
  headerCell: {
    minWidth: `${cellDimension.width}px`,
    minHeight: "100%"
  },
  headerText: {
    minWidth: `100%`,
    minHeight: `${cellDimension.height}px`,
    textOverflow: 'ellipsis'
  },
  paper: {
  }
}))

const HeaderCell = ({ title }) => {
  const classes = useStyles()

  return (
    <th className={classes.headerCell}>
      <div style={{
        width: '50px',
        height: '160px'
      }}>

        <div style={{
          transform: 'translate(-61px, 61px) rotate(-90deg)',
          width: '170px',
          maxHeight: '50px',
          paddingLeft: '5px'
        }}>
          <div style={{
            wordBreak: 'break-word',
            maxWidth: '14ch',
            maxHeight: '38px',
            overflow: 'hidden',
            textAlign: 'center',
            textOverflow: 'ellipsis'

          }}>
            {title}
          </div>
        </div >
      </div>
    </th>
  )
}

const TableCell = ({ toCourse, fromCourse }) => {
  const classes = useStyles()
  const concepts = toCourse.concepts.map(concept => {
    return concept.linksToConcept.filter(conceptLink => {
      return conceptLink.from.courses.find(course => course.id === fromCourse.id)
    }).length
  }).reduce((a, b) => a + b, 0)
  const weight = 25
  const greenWeight = 5;
  
  return (
    <td className={classes.tableCell} style={{ backgroundColor: `RGB(${255 - concepts * weight}, ${255 - concepts * greenWeight}, ${255 - concepts * weight})` }}>
    </td>
  )
}

const CourseHeatmap = ({ workspaceId }) => {
  const classes = useStyles()

  const workspaceCourseQuery = useQuery(WORKSPACE_COURSES_AND_CONCEPTS, {
    variables: { id: workspaceId }
  })

  const maxGradVal = workspaceCourseQuery.data.workspaceById ? 
  workspaceCourseQuery.data.workspaceById.courses.map(fromCourse => {
    return workspaceCourseQuery.data.workspaceById.courses.map(toCourse => {
      return toCourse.concepts.map(concept => {
        return concept.linksToConcept.filter(conceptLink => {
          return conceptLink.from.courses.find(course => course.id === fromCourse.id)
        }).length
      }).reduce((a, b) => a + b, 0)
    }).reduce((a, b) => a > b ? a : b, 0)
  }).reduce((a, b) => a > b ? a : b, 0)
  : null

  console.log(maxGradVal)

  return (
    <Grid item xs={12}>
      <Container maxWidth="md">
        <Card className={classes.paper} >
          <CardHeader title="Course overview" />
          {
            workspaceCourseQuery.data.workspaceById ?
              <CardContent>
                <div className="scrollSyncTable">
                  <table>
                    <thead>
                      <tr>
                        <HeaderCell />
                        {workspaceCourseQuery.data.workspaceById.courses.map(course => (
                          <HeaderCell key={course.id} title={course.name} />
                        ))
                        }

                      </tr>
                    </thead>

                    <tbody>
                      {
                        workspaceCourseQuery.data.workspaceById.courses.map(fromCourse => (
                          <tr key={`${fromCourse.id}`}>
                            <th> {fromCourse.name} </th>
                            {
                              workspaceCourseQuery.data.workspaceById.courses.map(toCourse => (
                                <TableCell key={`${fromCourse.id}-${toCourse.id}`} fromCourse={fromCourse} toCourse={toCourse} value={Math.random() * 255}/>
                              ))
                            }
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              </CardContent>
              :
              <div> Loading </div>
          }
        </Card>
      </Container>
    </Grid>
  )
}

export default CourseHeatmap