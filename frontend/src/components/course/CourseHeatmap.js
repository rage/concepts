import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'

import { withRouter } from 'react-router-dom'

import pink from '@material-ui/core/colors/pink'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import CircularProgress from '@material-ui/core/CircularProgress'

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
    '&:hover': {
      outline: '50px solid rgba(0, 0, 0, 0.05)',
      outlineOffset: '-50px',
      cursor: 'pointer',
      '& + div': {
        display: 'block'
      }
    },
    backgroundColor: '#ebedf0'
  },
  sideHeaderCell: {
    boxShadow: '1px 1px 0 0 black',
    padding: '0 10px 0 0'
  },
  headerCell: {
    minWidth: `${cellDimension.width}px`,
    minHeight: '100%',
    boxShadow: '0 1px 0 0 black',
    padding: '0 0 10px 0'
  },
  blankHeaderCell: {
    boxShadow: '1px 1px 0 0 black',
    minWidth: '150px',
    minHeight: '150px'
  },
  headerText: {
    minWidth: '100%',
    minHeight: `${cellDimension.height}px`,
    textOverflow: 'ellipsis'
  },
  paper: {
    maxHeight: '85vh'
  },
  popper: {
    padding: theme.spacing(2),
    position: 'relative',
    top: '-52px',
    left: '53px'
  },
  popperWrap: {
    position: 'absolute',
    display: 'none',
    '&:hover': {
    }
  },
  progress: {
    padding: theme.spacing(2)
  }
}))

const BlankHeaderCell = (props) => {
  const classes = useStyles()

  return (
    <th className={classes.blankHeaderCell}>
      <div style={{
        position: 'absolute',
        transform: 'translate(36px, -30px) rotate(-90deg)',
        right: '0'
      }}>Prerequisite</div>
      <div style={{
        position: 'absolute',
        bottom: '2px',
        right: '65%'
      }}>Target</div>
    </th>
  )
}

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
            overflowWrap: 'break-word',
            hyphens: 'auto',
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

const TableCell = withRouter(({ toCourse, fromCourse, minGradVal, maxGradVal, workspaceId, history }) => {
  const classes = useStyles()

  const conceptsLinked = toCourse.concepts.map(concept => {
    return concept.linksToConcept.filter(conceptLink => {
      return conceptLink.from.courses.find(course => course.id === fromCourse.id)
    }).length
  }).reduce((a, b) => a + b, 0)

  const onlyUnique = (v, i, a) => a.indexOf(v) === i
  const concepts = toCourse.concepts.map(concept => {
    return concept.linksToConcept.filter(conceptLink => {
      return conceptLink.from.courses.find(course => course.id === fromCourse.id)
    })
  }).reduce((first, second) => { return first.concat(second) }, [])
    .map(concept => concept.from.name)
    .filter(onlyUnique)

  const mapToGrad = (amount) => {
    const colorStrength = ['#fffff', ...Object.values(pink).slice(0, 9)]
    const val = (8 / maxGradVal) * (amount)
    return colorStrength[Math.ceil(val)]
  }

  const navigateToMapper = (courseId) => () => {
    history.push(`/workspaces/${workspaceId}/mapper/${courseId}`)
  }

  return (
    <>
      <td key={`table-${toCourse.id}-${fromCourse.id}`}>
        <div className={classes.tableCell} style={{
          backgroundColor: mapToGrad(conceptsLinked)
        }} onClick={navigateToMapper(toCourse.id)}>

        </div>
        {
          concepts.length !== 0 &&
          <div className={classes.popperWrap}>
            <Paper key={`paper-${toCourse.id}-${fromCourse.id}`} className={classes.popper}>
              {
                concepts.map(concept => (
                  <Typography key={`typo-${concept}`}> {concept} </Typography>
                ))
              }
            </Paper>
          </div>
        }
      </td>
    </>
  )
})

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


  return (
    <Grid item xs={12}>
      <Container maxWidth='xl'>
        <Card className={classes.paper} >
          <CardHeader title='Course overview' />
          {
            workspaceCourseQuery.data.workspaceById ?
              <CardContent>
                <div className='scrollSyncTable'>
                  <table>
                    <thead>
                      <tr>
                        <BlankHeaderCell />
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
                            <th className={classes.sideHeaderCell}> {fromCourse.name} </th>
                            {
                              workspaceCourseQuery.data.workspaceById.courses.map(toCourse => (
                                <TableCell workspaceId={workspaceId} minGradVal={0} maxGradVal={maxGradVal} key={`${fromCourse.id}-${toCourse.id}`} fromCourse={fromCourse} toCourse={toCourse} />
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
              <div style={{ textAlign: 'center' }}>
                <CircularProgress className={classes.progress} />
              </div>
          }
        </Card>
      </Container>
    </Grid>
  )
}

export default CourseHeatmap
