import React, { useState } from 'react' 

import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Container from '@material-ui/core/Container'

import TextField from '@material-ui/core/TextField'
import CircularProgress from '@material-ui/core/CircularProgress'

import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'

import green from '@material-ui/core/colors/green'
import { useErrorStateValue } from '../../store'

import Button from '@material-ui/core/Button'
import { useMutation } from 'react-apollo-hooks'
import {
  PORT_DATA
} from '../../graphql/Mutation'


const styles = theme => ({
  jsonField: {
    width: '100%',
    maxHeight: '50%'
  },
  wrapper: {
    position: 'relative',
    margin: theme.spacing(1)
  },
  buttonSuccess: {
    backgroundColor: green[500],
    '&:hover': {
      backgroundColor: green[700]
    }
  },
  buttonProgress: {
    color: green[500],
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  }
})

const PLACEHOLDER = `{
  "workpace|workspaceId": "id",
  "courses": [
    {
      "name": "Example",
      "default": true, // Only for default course
      "concepts": [
        {
          "name": "Concept 1",
          "description": "Description"
        }
      ]
    }
  ]
}
`

const TEMPLATE = `{
  "workpace": "",
  "courses": [
    {
      "name": "",
      "concepts": [
        {
          "name": "",
          "description": ""
        }
      ]
    }
  ]
}
`

const PortView = ({ classes }) => {
  const [data, setData] = useState('')
  const [buttonText, setButtonText] = useState('Port')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false) 

  const errorDispatch = useErrorStateValue()[1]
  const dataPortingMutation = useMutation(PORT_DATA, {})

  const addTemplate = () => {
    if (data.length === 0) {
      setData(TEMPLATE)
    }
  }

  const sendData = async () => {
    setLoading(true)
    
    try {
      await dataPortingMutation({
        variables: {
          data
        }
      })

      setSuccess(true)
      setButtonText('Data ported')
      setTimeout(() => {
        setSuccess(false)
        setButtonText('Port')
      }, 2000)
    } catch (err) {
      errorDispatch({
        type: 'setError',
        data: 'Malformated json'
      })
    }

    setLoading(false)
  }

  return (
    <Grid item xs={12}>
      <Container>
        <Card>
          <CardHeader title="Port data"/>
          
          <CardContent>
            <Button variant="contained" color="secondary" onClick={addTemplate}> Add template </Button>
            
            <TextField
              id="json-input"
              label="JSON"
              placeholder={PLACEHOLDER}
              multiline
              rowsMax="32"
              className={classes.jsonField}
              margin="normal"
              variant="outlined"
              onChange={(e) => setData(e.target.value)}
              value={data}
              disabled={loading}
            />
            <div className={classes.wrapper}>
              <Button  className={success ? classes.buttonSuccess : ''} color="primary" variant="contained" fullWidth onClick={sendData}> {buttonText} </Button>
              {
                loading && <CircularProgress size={24} className={classes.buttonProgress}/>
              }
            </div>
          </CardContent>
        </Card>
      </Container>
    </Grid>
  )
}

export default withStyles(styles)(PortView) 