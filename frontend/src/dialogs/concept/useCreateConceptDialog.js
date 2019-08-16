import React, { useRef, useState, useEffect } from 'react'
import { useMutation } from 'react-apollo-hooks'
import { Select, MenuItem, FormControl, InputLabel, OutlinedInput } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

import { CREATE_CONCEPT } from '../../graphql/Mutation'
import { useDialog } from '../DialogProvider'
import cache from '../../apollo/update'

const useStyles = makeStyles(theme => ({
  formControl: {
    marginTop: '16px'
  },
  select: {
    width: '200px'
  }
}))

const TagSelector = () => {
  const tagInputLabel = useRef(null)
  const { select, formControl } = useStyles()

  const [labelWidth, setLabelWidth] = useState(0)
  useEffect(() => {
    setLabelWidth(tagInputLabel.current.offsetWidth)
  }, [])

  const values = [
    'REMEMBER',
    'UNDERSTAND',
    'APPLY',
    'ANALYZE',
    'EVALUATE',
    'CREATE'
  ]

  const [value, setValue] = useState(values[0])

  const handleSelect = (event) => {
    setValue(event.target.value)
  }

  return (
    <FormControl variant='outlined' className={formControl}>
      <InputLabel ref={tagInputLabel} htmlFor='outlined-simple'>
        Tag
      </InputLabel>
      <Select
        className={select}
        value={value}
        onChange={handleSelect}
        input={<OutlinedInput labelWidth={labelWidth} name='Tag' id='outlined-simple' />}
      >
        {
          values.map(tag => (
            <MenuItem key={tag} value={tag}>
              {tag}
            </MenuItem>
          ))
        }
      </Select>
    </FormControl>
  )
}

const useCreateConceptDialog = workspaceId => {
  const { openDialog } = useDialog()

  const createConcept = useMutation(CREATE_CONCEPT, {
    update: cache.createConcept
  })

  return courseId => openDialog({
    mutation: createConcept,
    type: 'Concept',
    requiredVariables: {
      workspaceId,
      courseId,
      official: false
    },
    actionText: 'Create',
    title: 'Add concept',
    fields: [{
      name: 'name',
      required: true
    }, {
      name: 'description',
      multiline: true
    }],
    specialFields: [
      TagSelector
    ]
  })
}

export default useCreateConceptDialog
