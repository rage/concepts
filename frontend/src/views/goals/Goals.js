import React, { useState } from 'react'
import { useMutation } from '@apollo/react-hooks'
import { Card, CardHeader, List } from '@material-ui/core'

import { CREATE_CONCEPT, DELETE_CONCEPT, UPDATE_CONCEPT } from '../../graphql/Mutation'
import cache from '../../apollo/update'
import ConceptEditor from '../manager/ConceptEditor'
import { GoalItem } from './GoalItem'
import { useStyles } from './styles'

export const Goals = ({ workspaceId, goals, tagOptions, onClickCircle, onToggleGoal }) => {
  const classes = useStyles()
  const [editing, setEditing] = useState()

  const [createConcept] = useMutation(CREATE_CONCEPT, {
    update: cache.createConceptUpdate(workspaceId)
  })
  const [updateConcept] = useMutation(UPDATE_CONCEPT, {
    update: cache.updateConceptUpdate(workspaceId)
  })
  const [deleteConcept] = useMutation(DELETE_CONCEPT, {
    update: cache.deleteConceptUpdate(workspaceId)
  })

  return (
    <Card elevation={0} className={`${classes.card} ${classes.goals}`}>
      <CardHeader title='Goals' className={classes.cardHeader} />
      <List className={classes.list}>
        {goals.map(goal => editing === goal.id ? (
          <ConceptEditor
            submit={args => {
              setEditing(null)
              return updateConcept({ variables: args })
            }}
            tagOptions={tagOptions}
            cancel={() => setEditing(null)}
            defaultValues={goal}
            action='Save'
            key={goal.id}
          />
        ) : (
          <GoalItem
            onToggleGoal={onToggleGoal}
            updateConcept={variables => updateConcept({ variables })}
            deleteConcept={id => deleteConcept({ variables: { id } })}
            key={goal.id} goal={goal} setEditing={setEditing} onClickCircle={onClickCircle}
          />
        ))}
      </List>
      <ConceptEditor
        className={classes.formWithMask} action='Create' tagOptions={tagOptions}
        defaultValues={{ level: 'GOAL' }} submit={args => createConcept({
          variables: {
            workspaceId,
            ...args
          }
        })}
      />
    </Card>
  )
}
