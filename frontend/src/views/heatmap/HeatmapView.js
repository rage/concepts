import React from 'react'
import { withRouter } from 'react-router-dom'
import { useQuery } from '@apollo/react-hooks'
import { makeStyles } from '@material-ui/core/styles'
import { pink } from '@material-ui/core/colors'
import { Paper, Typography, Tooltip } from '@material-ui/core'

import { WORKSPACE_COURSES_AND_CONCEPTS } from '../../graphql/Query'
import NotFoundView from '../error/NotFoundView'
import LoadingBar from '../../components/LoadingBar'

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
  headerCell: {
    minWidth: `${cellDimension.width}px`,
    minHeight: '100%',
    boxShadow: '0 1px 0 0 black',
    padding: '0 0 10px 0',
    '& > div': {
      width: '50px',
      height: '160px',
      '& > div': {
        transform: 'translate(-61px, 61px) rotate(-90deg)',
        width: '170px',
        maxHeight: '50px',
        paddingLeft: '5px',
        '& > div': {
          hyphens: 'auto',
          maxWidth: '130px',
          fontWeight: 'normal'
        }
      }
    }
  },
  blankHeaderCell: {
    boxShadow: '1px 1px 0 0 black',
    minWidth: '150px',
    minHeight: '150px',
    '& > div.prerequisite': {
      position: 'absolute',
      transform: 'translate(34px, 24px) rotate(-90deg)',
      right: '0'
    },
    '& > div.target': {
      position: 'absolute',
      bottom: '4px',
      left: '4px'
    }
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
  tooltip: {
    backgroundColor: 'white',
    color: 'rgba(0, 0, 0, 0.87)',
    boxShadow: theme.shadows[1],
    fontSize: 16,
    margin: '2px'
  },
  popper: {
    padding: '5px'
  },
  sideHeaderCell: {
    fontWeight: 'normal'
  },
  headerOverflow: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    wordBreak: 'break-word',
    lineClamp: 2,
    boxOrient: 'vertical',
    display: '-webkit-box'
  }
}))

const BlankHeaderCell = () => {
  const classes = useStyles()

  return (
    <th className={classes.blankHeaderCell}>
      <div className='prerequisite'>Prerequisite</div>
      <div className='target'>Target</div>
    </th>
  )
}

const HeaderCell = ({ title }) => {
  const classes = useStyles()

  return (
    <th title={title} className={classes.headerCell}>
      <div>
        <div>
          <div className={classes.headerOverflow}>
            {title}
          </div>
        </div>
      </div>
    </th>
  )
}

const TableCell = withRouter(({
  toCourse, fromCourse, maxGradVal, workspaceId, history, urlPrefix
}) => {
  const classes = useStyles()

  const conceptsLinked = fromCourse.concepts
    .map(concept => concept.linksToConcept
      .filter(conceptLink => conceptLink.from.courses
        .find(course => course.id === toCourse.id)
      ).length
    ).reduce(sum, 0)

  const onlyUnique = (item, index, arr) => arr.indexOf(item) === index

  const concepts = fromCourse.concepts
    .flatMap(concept => concept.linksToConcept
      .filter(conceptLink => conceptLink.from.courses
        .find(course => course.id === toCourse.id))
    )
    .map(conceptLink => conceptLink.from.name)
    .filter(onlyUnique)

  const mapToGrad = (amount) => {
    const colorStrength = ['#ebedf0', ...Object.values(pink).slice(0, 9)]
    const val = (8 / maxGradVal) * (amount)
    return colorStrength[Math.ceil(val)]
  }

  const navigateToMapper = (courseId) => () => {
    history.push(`${urlPrefix}/${workspaceId}/mapper/${courseId}`)
  }

  return (
    <td key={`table-${toCourse.id}-${fromCourse.id}`}>
      { concepts.length > 0 ?
        <Tooltip
          placement='right'
          classes={{
            tooltip: classes.tooltip,
            popper: classes.popper
          }}
          title={<ul style={{ marginLeft: '-20px', marginRight: '5px' }}>
            {concepts.map(concept =>
              (<li key={`typo-${concept}`}>{concept}</li>))}
          </ul>
          }
        >
          <div
            className={classes.tableCell}
            style={{ backgroundColor: mapToGrad(conceptsLinked) }}
            onClick={navigateToMapper(toCourse.id)}
          />
        </Tooltip>
        :
        <div
          className={classes.tableCell}
          style={{ backgroundColor: mapToGrad(conceptsLinked) }}
          onClick={navigateToMapper(toCourse.id)}
        />
      }
    </td>
  )
})

const maxVal = (a, b) => a > b ? a : b
const sum = (a, b) => a + b

const HeatmapView = ({ workspaceId, urlPrefix }) => {
  const classes = useStyles()

  const workspaceCourseQuery = useQuery(WORKSPACE_COURSES_AND_CONCEPTS, {
    variables: { id: workspaceId }
  })

  if (workspaceCourseQuery.error) {
    return <NotFoundView message='Workspace not found' />
  } else if (workspaceCourseQuery.loading) {
    return <LoadingBar id='heatmap-view' />
  }

  const maxGradVal = workspaceCourseQuery.data && workspaceCourseQuery.data.workspaceById ?
    workspaceCourseQuery.data.workspaceById.courses
      .map(fromCourse => workspaceCourseQuery.data.workspaceById.courses
        .map(toCourse => toCourse.concepts
          .map(concept => concept.linksToConcept
            .filter(conceptLink => conceptLink.from.courses
              .find(course => course.id === fromCourse.id)
            ).length
          ).reduce(sum, 0)
        ).reduce(maxVal, 0)
      ).reduce(maxVal, 0)
    : null

  return (
    <div className={classes.paperWrapperHorizontal}><div className={classes.paperWrapperVertical}>
      <Paper className={classes.paper}>
        <Typography variant='h5' style={{ marginBottom: '32px' }}>Course overview</Typography>
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
                        <th title={fromCourse.name} className={classes.sideHeaderCell}>
                          <div className={classes.headerOverflow}>
                            {fromCourse.name}
                          </div>
                        </th>
                        {
                          workspaceCourseQuery.data.workspaceById.courses.map(toCourse => (
                            <TableCell
                              workspaceId={workspaceId} maxGradVal={maxGradVal}
                              key={`${fromCourse.id}-${toCourse.id}`} fromCourse={fromCourse}
                              toCourse={toCourse} urlPrefix={urlPrefix} />
                          ))
                        }
                      </tr>
                    ))
                  }
                </tbody>
              </table>
              :
              <Typography style={{ color: '#bbb', textAlign: 'center' }}>
                No courses available
              </Typography>
          }
        </div>
      </Paper>
    </div></div>
  )
}

export default HeatmapView
