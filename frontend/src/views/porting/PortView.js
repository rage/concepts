import React, { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation } from 'react-apollo-hooks'
import { makeStyles } from '@material-ui/core/styles'
import {
  Container, TextField, CircularProgress, Card, CardHeader, CardContent,
  Button, FormControl, InputLabel, Select, OutlinedInput, MenuItem
} from '@material-ui/core'
import green from '@material-ui/core/colors/green'
import Ajv from 'ajv'

import schema from '../../static/port.schema'
import {
  IMPORT_DATA
} from '../../graphql/Mutation'
import {
  PROJECTS_FOR_USER, WORKSPACES_FOR_USER, PROJECT_BY_ID_TEMPLATES
} from '../../graphql/Query'
import { useMessageStateValue, useLoginStateValue } from '../../store'
import cache from '../../apollo/update'

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
  },
  projectSelect: {
    marginTop: theme.spacing(2),
    marginRight: theme.spacing(1),
    minWidth: 120
  },
  workspaceSelect: {
    marginTop: theme.spacing(2),
    marginRight: theme.spacing(1),
    minWidth: 140
  },
  workspaceName: {
    marginTop: theme.spacing(2)
  }
}))

const PLACEHOLDER = `{
  "workspace | workspaceId": "id",
  "projectId": "id", // Optional field
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
  "workspace": "My workspace",
  "courses": [
    {
      "name": "My course",
      "concepts": [
        {
          "name": "My concept",
          "description": "Description of my concept",
          "prerequisites": [
            {
              "name":"Prerequisite concept"
            }
          ]
        }
      ],
      "prerequisites":[
        "Prerequisite course"
      ]
    },
    {
      "name":"Prerequisite course",
      "concepts": [
        {
          "name": "Prerequisite concept",
          "description": "Description of prerequisite concept",
          "prerequisites":[]
        }
      ],
      "prerequisites":[]
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
    update: cache.jsonPortUpdate(user.id)
  })

  // Select properties
  const [selectState, setSelectState] = useState({
    projectId: '',
    workspaceId: '',
    workspaceName: ''
  })
  const projectInputLabel = useRef(null)
  const workspaceInputLabel = useRef(null)
  const [projectLabelWidth, setProjectLabelWidth] = useState(0)
  const [workspaceLabelWidth, setWorkspaceLabelWidth] = useState(0)
  useEffect(() => {
    setProjectLabelWidth(projectInputLabel.current.offsetWidth)
    setWorkspaceLabelWidth(workspaceInputLabel.current.offsetWidth)
  }, [])
  // End select properties

  const projectsQuery = useQuery(PROJECTS_FOR_USER)
  const templatesQuery = useQuery(PROJECT_BY_ID_TEMPLATES, {
    skip: selectState.projectId === '',
    variables: {
      id: selectState.projectId
    }
  })
  const workspacesQuery = useQuery(WORKSPACES_FOR_USER)

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
        errorMessage = 'must have either workspace or workspaceId'
      } else if (error.keyword === 'minLength' && error.params.limit === 1) {
        errorMessage = `${error.dataPath.replace('.', '')} must not be empty if set`
      } else {
        errorMessage = `Unknown error: ${error['message']}`
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

  const addStateDataToJSON = (jsonData) => {
    if (selectState.workspaceId !== '') {
      jsonData['workspaceId'] = selectState.workspaceId
      if (selectState.projectId !== '') {
        jsonData['projectId'] = selectState.projectId
      }
      if (jsonData['workspace']) delete jsonData['workspace']
    } else if (selectState.workspaceName !== '') {
      jsonData['workspace'] = selectState.workspaceName
      if (selectState.projectId !== '') {
        jsonData['projectId'] = selectState.projectId
      }
      if (jsonData['workspaceId']) delete jsonData['workspaceId']
    }
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

    addStateDataToJSON(jsonData)
    if (!validateJSON(jsonData)) {
      return
    }

    setLoading(true)

    try {
      await dataPortingMutation({
        variables: {
          data: JSON.stringify(jsonData)
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

  const handleChange = (event) => {
    setSelectState({
      ...selectState,
      [event.target.name]: event.target.value
    })
  }

  const workspaceOptions = () => {
    if (selectState.projectId)
      return templatesQuery.data.projectById &&
        templatesQuery.data.projectById.templates
    else
      return workspacesQuery.data.workspacesForUser &&
        workspacesQuery.data.workspacesForUser
          .filter(w => !w.workspace.asTemplate)
          .map(w => w.workspace)
  }

  return (
    <Container>
      <Card>
        <CardHeader title='Import data' />

        <CardContent>
          <div>
            <Button variant='contained' color='secondary' onClick={addTemplate}>
              Add template
            </Button>
            <Button className={classes.rowButton}
              variant='contained'
              color='secondary'
              component='label'
              label='Open...'>
              Open...
              <input type='file' onChange={openFile} allow='text/*' hidden />
            </Button>
          </div>

          <div>
            <FormControl variant='outlined' className={classes.projectSelect}>
              <InputLabel ref={projectInputLabel} htmlFor='outlined-simple'>
                Project
              </InputLabel>
              <Select
                value={selectState.projectId}
                onChange={handleChange}
                input={
                  <OutlinedInput
                    labelWidth={projectLabelWidth}
                    name='projectId'
                    id='outlined-simple'
                  />
                }
              >
                <MenuItem value={''}>
                  <em>None</em>
                </MenuItem>
                {
                  projectsQuery.data.projectsForUser && projectsQuery.data.projectsForUser
                    .map(p => (
                      <MenuItem key={p.project.id} value={p.project.id}>
                        {p.project.name}
                      </MenuItem>)
                    )
                }
              </Select>
            </FormControl>
            {
              selectState.workspaceName === ''
                ? <FormControl variant='outlined' className={classes.workspaceSelect}>
                  <InputLabel ref={workspaceInputLabel} htmlFor='outlined-simple'>
                    {selectState.projectId === '' ? 'Workspace' : 'Template'}
                  </InputLabel>
                  <Select
                    value={selectState.workspaceId}
                    onChange={handleChange}
                    input={
                      <OutlinedInput
                        labelWidth={workspaceLabelWidth}
                        name='workspaceId'
                        id='outlined-simple'
                      />
                    }
                  >
                    <MenuItem value={''}>
                      <em>None</em>
                    </MenuItem>
                    {
                      workspaceOptions() && workspaceOptions().map(w =>
                        <MenuItem key={w.id} value={w.id}>
                          {w.name}
                        </MenuItem>
                      )

                    }
                  </Select>
                </FormControl>
                : null
            }
            {
              selectState.workspaceId === ''
                ? <TextField
                  id='workspaceName'
                  name='workspaceName'
                  label={selectState.projectId === '' ? 'Workspace name' : 'Template name'}
                  className={classes.workspaceName}
                  value={selectState.workspaceName}
                  onChange={handleChange}
                  variant='outlined'
                />
                : null
            }
          </div>

          <TextField
            id='json-input'
            label='JSON'
            placeholder={PLACEHOLDER}
            multiline
            rowsMax='13'
            rows='10'
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
