import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import './heatmap.css'
const useStyles = makeStyles(theme => ({

}))

const CourseHeatmap = (props) => {
  const classes = useStyles()

  return (
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
  )
}

export default CourseHeatmap