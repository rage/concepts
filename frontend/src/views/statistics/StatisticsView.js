import React, { useRef, useLayoutEffect } from 'react'
import { Grid, Typography, Card, CardContent, Tooltip } from '@material-ui/core'
import { useQuery } from '@apollo/react-hooks'
import { makeStyles } from '@material-ui/core/styles'
import {
  People as PeopleIcon, Note as NoteIcon, Share as ShareIcon, CheckCircle as CheckCircleIcon
} from '@material-ui/icons'
import Chart from 'chart.js'

import { PROJECT_STATISTICS } from '../../graphql/Query'
import NotFoundView from '../error/NotFoundView'
import LoadingBar from '../../components/LoadingBar'

const useStyles = makeStyles({
  cardStyle: {
    width: '100%',
    maxWidth: '1280px',
    margin: '0 auto'
  },
  root: {
    width: '90%',
    display: 'grid',
    margin: '0 auto',
    gridTemplate: `"statistics" 60px
                   "graph" 1fr`
  },
  statistics: {
    display: 'grid',
    gridGap: '15px',
    gridTemplate: `"participants  concepts links completion" 1fr
                   / 120px 120px 120px 120px`
  },
  participants: {
    gridArea: 'participants'
  },
  concepts: {
    gridArea: 'concepts'
  },
  links: {
    gridArea: 'links'
  },
  graph: {
    gridArea: 'graph'
  },
  completion: {
    gridArea: 'completion'
  }
})

const Participants = ({ amount }) => {
  const classes = useStyles()

  return (
    <Grid
      container direction='row' spacing={1} alignItems='center' className={classes.participants}
    >
      <Grid item>
        <Tooltip title='Participants' arrow placement='bottom'>
          <PeopleIcon fontSize='large' />
        </Tooltip>
      </Grid>
      <Grid item>
        <Typography variant='h5'>
          {amount}
        </Typography>
      </Grid>
    </Grid>
  )
}

const Concepts = ({ amount }) => {
  const classes = useStyles()

  return (
    <Grid container direction='row' spacing={1} alignItems='center' className={classes.concepts}>
      <Grid item>
        <Tooltip title='Concepts created' arrow placement='bottom'>
          <NoteIcon fontSize='large' />
        </Tooltip>
      </Grid>
      <Grid item>
        <Typography variant='h5'>
          {amount}
        </Typography>
      </Grid>
    </Grid>
  )
}

const Links = ({ amount }) => {
  const classes = useStyles()

  return (
    <Grid container direction='row' spacing={1} alignItems='center' className={classes.links}>
      <Grid item>
        <Tooltip title='Links created' arrow placement='bottom'>
          <ShareIcon fontSize='large' />
        </Tooltip>
      </Grid>
      <Grid item>
        <Typography variant='h5'>
          {amount}
        </Typography>
      </Grid>
    </Grid>
  )
}

const Completion = ({ percentage }) => {
  const classes = useStyles()

  return (
    <Grid container direction='row' spacing={1}
      alignItems='center' className={classes.completion}>
      <Grid item>
        <Tooltip title='Completion' arrow placement='bottom'>
          <CheckCircleIcon fontSize='large' />
        </Tooltip>
      </Grid>
      <Grid item>
        <Typography variant='h5'>
          {percentage}%
        </Typography>
      </Grid>
    </Grid>
  )
}

const StatisticsView = ({ projectId }) => {
  const classes = useStyles()
  const graphRef = useRef(null)

  const projectQuery = useQuery(PROJECT_STATISTICS, {
    variables: { id: projectId }
  })

  useLayoutEffect(() => {
    if (graphRef.current) {
      const { pointList } = projectQuery.data.projectStatistics
      const sortedPointList = pointList.slice().sort((a, b) => a.value - b.value)

      const settings = {
        type: 'bar',
        data: {
          labels: sortedPointList.map(item => item.value),
          datasets: [{
            display: false,
            label: 'Completions',
            data: sortedPointList.map(item => item.amount),
            backgroundColor: 'rgba(0, 0, 100, 0.4)'
          }]
        },
        options: {
          title: {
            display: true,
            text: 'Points gained'
          },
          legend: {
            display: false
          }
        }
      }

      new Chart(graphRef.current, settings)
    }
  }, [projectQuery.loading])

  if (projectQuery.loading) {
    return <LoadingBar id='project-view' />
  } else if (projectQuery.error) {
    return <NotFoundView message='Project not found' />
  }

  const {
    participants,
    concepts,
    links,
    maxPoints,
    completedPoints
  } = projectQuery.data.projectStatistics
  const completionPercentage = maxPoints === 0 ? 0 :
    Math.round((completedPoints / (maxPoints * participants)) * 100)

  return (
    <Card elevation={0} className={classes.cardStyle}>
      <CardContent className={classes.root}>
        <div className={classes.statistics}>
          <Participants amount={participants} />
          <Concepts amount={concepts} />
          <Links amount={links} />
          <Completion percentage={completionPercentage} />
        </div>
        <div className={classes.graph}>
          <canvas ref={graphRef} />
        </div>
      </CardContent>
    </Card>
  )
}

export default StatisticsView
