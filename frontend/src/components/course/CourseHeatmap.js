import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'

import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'

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
            { title }
          </div>
        </div >
      </div>
    </th>
  )
}

const TableCell = (props) => {
  const classes = useStyles()

  return (
    <td className={classes.tableCell} style={{ backgroundColor: "RGB(0, " + Math.random() * 255 + ", 0)" }}>
    </td>
  )
}

const CourseHeatmap = (props) => {
  const classes = useStyles()

  return (
    <Grid item xs={12}>
      <Container maxWidth="md">
        <Card className={classes.paper} >

          <CardHeader title="Course overview" />
          <CardContent>

            <div className="scrollSyncTable">
              <table>
                <thead>
                  <tr>
                    <HeaderCell />

                    <HeaderCell title="Ohjelmistotuotantoprojekti"/>
                    <HeaderCell title="Ohjelmistotuotantoprojekti"/>
                    <HeaderCell title="Ohjelmistotuotantoprojekti"/>
                    <HeaderCell title="Ohjelmistotuotantoprojekti"/>
                    <HeaderCell title="Ohjelmistotuotantoprojekti"/>
                    <HeaderCell title="Ohjelmistotuotantoprojekti"/>
                    <HeaderCell title="Ohjelmistotuotantoprojekti"/>
                    <HeaderCell title="Ohjelmistotuotantoprojekti"/>
                    <HeaderCell title="Ohjelmistotuotantoprojekti"/>
                    <HeaderCell title="Ohjelmistotuotantoprojekti"/>

                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <th>HEAD</th>

                    <TableCell />
                    <TableCell />
                    <TableCell />
                    <TableCell />
                    <TableCell />

                    <TableCell />
                    <TableCell />
                    <TableCell />
                    <TableCell />
                    <TableCell />
                  </tr>
                  <tr>
                    <th>HEAD</th>

                    <TableCell />
                    <TableCell />
                    <TableCell />
                    <TableCell />
                    <TableCell />
                    <TableCell />
                    <TableCell />
                    <TableCell />
                    <TableCell />
                    <TableCell />
                  </tr>
                  <tr>
                    <th>HEAD</th>

                    <TableCell />
                    <TableCell />
                    <TableCell />
                    <TableCell />
                    <TableCell />
                    <TableCell />
                    <TableCell />
                    <TableCell />
                    <TableCell />
                    <TableCell />
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </Container>
    </Grid>
  )
}

export default CourseHeatmap