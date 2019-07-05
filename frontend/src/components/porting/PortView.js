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
import { useErrorStateValue, useLoginStateValue } from '../../store'

import Button from '@material-ui/core/Button'
import { useMutation } from 'react-apollo-hooks'
import {
  PORT_DATA
} from '../../graphql/Mutation'

import { jsonPortUpdate } from '../../apollo/update'


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
    color: 'white',
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  },
  rowButton: {
    marginLeft: '4px'
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

const PortView = ({ classes }) => {
  const [data, setData] = useState('')
  const [buttonText, setButtonText] = useState('Port')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const [{ user }] = useLoginStateValue()
  const errorDispatch = useErrorStateValue()[1]

  const dataPortingMutation = useMutation(PORT_DATA, {
    update: jsonPortUpdate(user.id)
  })

  const addTemplate = () => {
    if (data.length === 0) {
      setData(TEMPLATE)
    }
  }

  const openFile = (event) => {
    event.preventDefault()
    if (event.target.files.length === 0) return
    const fileReader = new FileReader()

    fileReader.onload = (event) => {
      event.preventDefault()
      let content = fileReader.result
      // eslint-disable-next-line no-control-regex
      if (/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/.test(content)) {
        let confirm = window.confirm('File contains unprintable characters, continue?')
        if (!confirm) {
          return
        }
      }
      if (content.length > 50 * 1024) {
        let sendDirectly = window.confirm('File too big, send directly?')
        if (sendDirectly) {
          sendData(content)
        }
      } else {
        setData(content)
      }
    }

    fileReader.readAsText(event.target.files[0])
  }

  const sendData = async (jsonData) => {
    setLoading(true)

    try {
      await dataPortingMutation({
        variables: {
          data: jsonData
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
          <CardHeader title='Port data' />

          <CardContent>
            <Button variant='contained' color='secondary' onClick={addTemplate}> Add template </Button>
            <Button className={classes.rowButton}
              variant='contained'
              color='secondary'
              component='label'
              label='Open...'>
              Open...
              <input type='file' onChange={openFile} allow='text/*' hidden />
            </Button>

            <TextField
              id='json-input'
              label='JSON'
              placeholder={PLACEHOLDER}
              multiline
              rowsMax='32'
              className={classes.jsonField}
              margin='normal'
              variant='outlined'
              onChange={(e) => setData(e.target.value)}
              value={data}
              disabled={loading}
            />
            <div className={classes.wrapper}>
              <Button className={success ? classes.buttonSuccess : ''} color='primary' variant='contained' fullWidth onClick={() => sendData(data)}> {buttonText} </Button>
              {
                loading && <CircularProgress size={24} className={classes.buttonProgress} />
              }
            </div>
          </CardContent>
        </Card>
      </Container>
    </Grid>
  )
}

export default withStyles(styles)(PortView)
