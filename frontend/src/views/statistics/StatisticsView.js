import React, { useRef, useLayoutEffect } from 'react'
import { Grid, Typography, Card, CardContent } from '@material-ui/core'
import LoadingBar from '../../components/LoadingBar'
import NotFoundView from '../error/NotFoundView'
import { useQuery } from '@apollo/react-hooks'
import { PROJECT_STATISTICS } from '../../graphql/Query'
import { makeStyles } from '@material-ui/core/styles'
import { 
  People as PeopleIcon, 
  Note as NoteIcon,
  Share as ShareIcon
 } from '@material-ui/icons'
import Chart from 'chart.js'

const useStyles = makeStyles(theme => ({
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
    gridTemplate: `"participants  concepts links" 1fr
                   / 90px 90px 90px`
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
  }
}))

const Participants = ({ amount }) => {
  const classes = useStyles()

  return (
    <Grid container direction="row" spacing={1}
      alignItems="center" className={classes.participants}>
      <Grid item>
        <PeopleIcon fontSize="large"/>
      </Grid>
      <Grid item>
        <Typography variant='h5'>
          { amount }
        </Typography>
      </Grid>
    </Grid>
  )
}

const Concepts = ({ amount }) => {
  const classes = useStyles()

  return (
    <Grid container direction="row" spacing={1}
      alignItems="center" className={classes.concepts}>
      <Grid item>
        <NoteIcon fontSize="large"/>
      </Grid>
      <Grid item>
        <Typography variant='h5'>
          { amount }
        </Typography>
      </Grid>
    </Grid>
  )
}

const Links = ({ amount }) => {
  const classes = useStyles()

  return (
    <Grid container direction="row" spacing={1}
      alignItems="center" className={classes.links}>
      <Grid item>
        <ShareIcon fontSize="large"/>
      </Grid>
      <Grid item>
        <Typography variant='h5'>
          { amount }
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
      const { pointList } = JSON.parse(projectQuery.data.projectStatistics)
      console.log(pointList)
      console.log("Labels:", Object.keys(pointList))
      console.log("Data:", Object.values(pointList))
      const settings = {
        type: 'bar',
        data: {
          labels: Object.keys(pointList),
          datasets: [{
            display: false,
            label: 'Completions',
            data: Object.values(pointList),
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

      const canvas = new Chart(graphRef.current, settings)
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
  } = JSON.parse(projectQuery.data.projectStatistics)

  return (
    <Card elevation={0} className={classes.cardStyle}>
      <CardContent className={classes.root}>
        <div className={classes.statistics}>
          <Participants amount={participants}/>
          <Concepts amount={concepts}/> 
          <Links amount={links}/>
        </div>
        <div className={classes.graph}>
          <canvas ref={graphRef}/>
        </div>
      </CardContent>
    </Card>
  )
}

export default StatisticsView