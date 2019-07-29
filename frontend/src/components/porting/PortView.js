import React, { useState } from 'react'
import { useMutation } from 'react-apollo-hooks'
import { makeStyles } from '@material-ui/core/styles'
import {
  Container, TextField, CircularProgress, Card, CardHeader, CardContent, Button
} from '@material-ui/core'
import green from '@material-ui/core/colors/green'
import Ajv from 'ajv'

import schema from './port.schema'
import {
  IMPORT_DATA
} from '../../graphql/Mutation'
import { useMessageStateValue, useLoginStateValue } from '../../store'
import { jsonPortUpdate } from '../../apollo/update'


const useStyles = makeStyles(theme => ({
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
}))

const PLACEHOLDER = `{
  "workspace | workspaceId": "id",
  "courses": [
    {
      "name": "Example",
      "concepts": [
        {
          "name": "Concept 1",
          "description": "Description",
          "prerequisites": [
            {
              "name": "",
              "official": true, // Optional field
              "course": "" // Optional field
            }
          ]
        }
      ],
      "prerequisites": [
        "Prerequisite course name"
      ]
    }
  ]
}
`

const TEMPLATE = `{
  "workspace": "",
  "courses": [
    {
      "name": "",
      "concepts": [
        {
          "name": "",
          "description": "",
          "prerequisites": [
            {
              "name":""
            }
          ]
        }
      ],
      "prerequisites":[
        ""
      ]
    }
  ]
}
`

const ajv = Ajv()
const validateData = ajv.compile(schema)

const PortView = () => {
  const classes = useStyles()
  const [data, setData] = useState('')
  const [buttonText, setButtonText] = useState('Import')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const [{ user }] = useLoginStateValue()
  const messageDispatch = useMessageStateValue()[1]

  const dataPortingMutation = useMutation(IMPORT_DATA, {
    update: jsonPortUpdate(user.id)
  })

  const addTemplate = () => {
    if (data.length === 0) {
      setData(TEMPLATE)
    }
  }

  const validateJSON = (jsonData) => {
    if (!validateData(jsonData)) {
      const error = validateData.errors[0]
      let errorMessage
      if (error.keyword === 'required') {
        errorMessage = error['message']
      } else if (error.keyword === 'additionalProperties') {
        errorMessage = `Unknown property '${error.params.additionalProperty}'`
      } else if (error.keyword === 'type') {
        errorMessage = `${error.dataPath.replace('.', '')} ${error.message}`
      } else if (error.keyword === 'oneOf') {
        errorMessage = 'should have either workspace or workspaceId'
      }

      messageDispatch({
        type: 'setError',
        data: errorMessage
      })

      return false
    }
    return true
  }

  const openFile = (event) => {
    event.preventDefault()
    if (event.target.files.length === 0) return
    const fileReader = new FileReader()

    fileReader.onload = (event) => {
      event.preventDefault()
      const content = fileReader.result
      // eslint-disable-next-line no-control-regex
      if (/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/.test(content)) {
        const confirm = window.confirm('File contains unprintable characters, continue?')
        if (!confirm) {
          return
        }
      }
      if (content.length > 50 * 1024) {
        const sendDirectly = window.confirm('File too big, send directly?')
        if (sendDirectly) {
          sendData(content)
        }
      } else {
        setData(content)
      }
    }

    fileReader.readAsText(event.target.files[0])
  }

  const sendData = async (data) => {
    if (loading || success) return

    let jsonData
    try {
      jsonData = JSON.parse(data)
    } catch (error) {
      messageDispatch({
        type: 'setError',
        data: 'Malformed JSON'
      })
      return
    }

    if (!validateJSON(jsonData)) {
      return
    }

    setLoading(true)

    try {
      await dataPortingMutation({
        variables: {
          data: data
        }
      })

      setSuccess(true)
      setButtonText('Data imported')
      setTimeout(() => {
        setSuccess(false)
        setButtonText('Import')
      }, 2000)
    } catch (err) {
      messageDispatch({
        type: 'setError',
        data: 'Error sending data'
      })
    }

    setLoading(false)
  }

  return (
    <Container>
      <Card>
        <CardHeader title='Import data' />

        <CardContent>
          <Button variant='contained' color='secondary' onClick={addTemplate}>Add template</Button>
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
            <Button
              className={success ? classes.buttonSuccess : ''}
              color='primary'
              variant='contained'
              fullWidth
              onClick={() => sendData(data)}
            >
              {!loading ? buttonText : '\u00A0'}
            </Button>
            {
              loading && <CircularProgress size={24} className={classes.buttonProgress} />
            }
          </div>
        </CardContent>
      </Card>
    </Container>
  )
}

export default PortView
