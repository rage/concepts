import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import './heatmap.css'

const useStyles = makeStyles(theme => ({

}))

const CourseHeatmap = (props) => {
  const classes = useStyles()

  return (
      <Grid item xs={12}>
        <Container maxWidth="sm">
          <div className="scrollSyncTable">
            <table>
              <thead>
                <tr>
                  <th></th>

                  <th><div>HEAD</div></th>
                  <th><div>HEAD</div></th>
                  <th><div>HEAD</div></th>
                  <th><div>HEAD</div></th>
                  <th><div>HEAD</div></th>

                  <th><div>HEAD</div></th>
                  <th><div>HEAD</div></th>
                  <th><div>HEAD</div></th>
                  <th><div>HEAD</div></th>
                  <th><div>HEAD</div></th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <th>HEAD</th>

                  <td>BODY</td>
                  <td>BODY</td>
                  <td>BODY</td>
                  <td>BODY</td>
                  <td>BODY</td>

                  <td>BODY</td>
                  <td>BODY</td>
                  <td>BODY</td>
                  <td>BODY</td>
                  <td>BODY</td>
                </tr>
                <tr>
                  <th>HEAD</th>

                  <td>BODY</td>
                  <td>BODY</td>
                  <td>BODY</td>
                  <td>BODY</td>
                  <td>BODY</td>

                  <td>BODY</td>
                  <td>BODY</td>
                  <td>BODY</td>
                  <td>BODY</td>
                  <td>BODY</td>
                </tr>
                <tr>
                  <th>HEAD</th>

                  <td>BODY</td>
                  <td>BODY</td>
                  <td>BODY</td>
                  <td>BODY</td>
                  <td>BODY</td>

                  <td>BODY</td>
                  <td>BODY</td>
                  <td>BODY</td>
                  <td>BODY</td>
                  <td>BODY</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Container>
      </Grid>
  )
}

export default CourseHeatmap