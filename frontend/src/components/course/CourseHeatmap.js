import React from 'react'
import { withRouter } from 'react-router-dom'
import { useQuery } from 'react-apollo-hooks'
import { makeStyles } from '@material-ui/core/styles'

import { pink } from '@material-ui/core/colors'
import { Paper, Typography, CircularProgress } from '@material-ui/core'

import {
  WORKSPACE_COURSES_AND_CONCEPTS
} from '../../graphql/Query'

const cellDimension = {
  width: 50,
  height: 50
}

const useStyles = makeStyles(theme => ({
  scrollSyncTable: {
    overflow: 'auto',
    maxHeight: '100%',
    maxWidth: '100%',
    '& > table': {
      position: 'relative',
      borderCollapse: 'collapse',
      '& th': {
        position: 'sticky',
        top: 0,
        background: '#fff'
      },
      '& > thead th': {
        color: '#000',
        '&:first-child': {
          left: 0,
          zIndex: 1
        }
      },
      '& > tbody th': {
        width: '150px',
        left: 0
      }
    }
  },
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
    boxShadow: '1px 0 0 0 black',
    padding: '0 10px 0 0',
    width: '230px',
    fontWeight:'normal'
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
  paperWrapperHorizontal: {
    display: 'flex',
    justifyContent: 'center',
    margin: '8px 16px',
    maxWidth: '100%',
    overflow: 'hidden'
  },
  paperWrapperVertical: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    overflow: 'hidden'
  },
  paper: {
    padding: '16px',
    maxHeight: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column'
  },
  popper: {
    padding: theme.spacing(2),
    position: 'relative',
    top: '-52px',
    left: '53px'
  },
  popperWrap: {
    position: 'fixed',
    display: 'none',
    '&:hover': {
    }
  },
  progress: {
    padding: theme.spacing(2)
  }
}))

const BlankHeaderCell = () => {
  const classes = useStyles()

  return (
    <th className={classes.blankHeaderCell}>
      <div style={{
        position: 'absolute',
        transform: 'translate(34px, 24px) rotate(-90deg)',
        right: '0'
      }}>Prerequisite</div>
      <div style={{
        position: 'absolute',
        bottom: '4px',
        left: '4px'
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
            textOverflow: 'ellipsis',
            fontWeight: 'normal'
          }}>
            {title}
          </div>
        </div>
      </div>
    </th>
  )
}

const TableCell = withRouter(({
  toCourse, fromCourse, maxGradVal, workspaceId, history
}) => {
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
    <td key={`table-${toCourse.id}-${fromCourse.id}`}>
      <div
        className={classes.tableCell}
        style={{ backgroundColor: mapToGrad(conceptsLinked) }}
        onClick={navigateToMapper(toCourse.id)}
      />
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
  )
})

const maxVal = (a, b) => a > b ? a : b
const sum = (a, b) => a + b

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
        }).reduce(sum, 0)
      }).reduce(maxVal, 0)
    }).reduce(maxVal, 0)
    : null


  return (
    <div className={classes.paperWrapperHorizontal}><div className={classes.paperWrapperVertical}>
      <Paper className={classes.paper}>
        <Typography variant='h5' style={{ marginBottom: '32px' }}>Course overview</Typography>
        {
          workspaceCourseQuery.data.workspaceById ?
            <div className={classes.scrollSyncTable}>
              {
                workspaceCourseQuery.data.workspaceById.courses.length > 0 ?
                  <table>
                    <thead>
                      <tr>
                        <BlankHeaderCell />
                        {workspaceCourseQuery.data.workspaceById.courses.map(course => (
                          <HeaderCell key={course.id} title={course.name} />
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {
                        workspaceCourseQuery.data.workspaceById.courses.map(fromCourse => (
                          <tr key={`${fromCourse.id}`}>
                            <th className={classes.sideHeaderCell}> {fromCourse.name} </th>
                            {
                              workspaceCourseQuery.data.workspaceById.courses.map(toCourse => (
                                <TableCell
                                  workspaceId={workspaceId} maxGradVal={maxGradVal}
                                  key={`${fromCourse.id}-${toCourse.id}`} fromCourse={fromCourse}
                                  toCourse={toCourse} />
                              ))
                            }
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>:
                  <Typography style={{ color: '#bbb', textAlign: 'center' }}>No courses available</Typography>
              }
            </div>
            :
            <div style={{ textAlign: 'center' }}>
              <CircularProgress className={classes.progress} />
            </div>
        }
      </Paper>
    </div></div>
  )
}

export default CourseHeatmap
