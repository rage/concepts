import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'

import { FixedSizeGrid } from 'react-window'

import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'

import { useMutation } from 'react-apollo-hooks'
import {
  createConceptLinkUpdate,
  deleteConceptLinkUpdate
} from '../../apollo/update'
import {
  CREATE_CONCEPT_LINK,
  DELETE_CONCEPT_LINK
} from '../../graphql/Mutation'


const useStyles = makeStyles(() => ({
  cellButton: {
    width: '90%'
  },
  active: {
    backgroundColor: '#9ecae1',
    '&:hover': {
      backgroundColor: '#9ecae1'
    },
    '&:focus': {
      backgroundColor: '#9ecae1'
    }
  },
  inactive: {
    backgroundColor: '#fff',
    '&:focus': {
      backgroundColor: '#fff'
    }
  },
  header: {
    color: 'gray',
    '&.bold': {
      color: 'black'
    }
  }
}))


const GridCell = ({ onClick, checked, onHover, onMouseLeave }) => {
  const classes = useStyles()
  return (
    <Button
      className={classes.cellButton}
      onClick={onClick}
      variant='contained'
      onMouseEnter={onHover}
      onMouseLeave={onMouseLeave}
      color={checked ? 'primary' : 'secondary'}>
      {checked ? 'LINKED' : 'UNLINKED'}
    </Button>
  )
}

const CourseMatrix = ({ courseAndPrerequisites, workspaceId, dimensions }) => {
  const classes = useStyles()

  const allPrerequisiteConcepts = courseAndPrerequisites.linksToCourse
    .map(course => course.from.concepts)
    .reduce((concepts, allConcepts) => {
      return allConcepts.concat(concepts)
    }, [])

  const headerGrid = React.createRef()
  const sideGrid = React.createRef()

  const rowCount = courseAndPrerequisites.concepts.length
  const columnWidth = 110
  const rowHeight = 70

  const headerHeight = 160
  const sideHeaderWidth = 250
  const height = 470

  const [filter, setFilter] = useState('')

  const HeaderCell = ({ columnIndex, data, style }) => (
    <div style={style}>
      <div id={`course-matrix-col-${columnIndex}`} className={classes.header} style={{
        transform: 'translate(0px, 51px) rotate(315deg)',
        width: '150px',
        textOverflow: 'ellipsis'
      }}>
        <span style={{ overflow: 'hidden', maxWidth: '3ch' }}>
          {data[columnIndex].name}
        </span>
      </div>
    </div>
  )

  const RowHeaderCell = ({ data, rowIndex, style }) => (
    <div style={style}>
      <div id={`course-matrix-row-${rowIndex}`} className={classes.header} style={{
        margin: '12px 20px 0px 0px',
        width: '200px'
      }}>
        {data[rowIndex].name}
      </div>
    </div>
  )

  const deleteConceptLink = useMutation(DELETE_CONCEPT_LINK, {
    update: deleteConceptLinkUpdate(courseAndPrerequisites.id, workspaceId)
  })

  const createConceptLink = useMutation(CREATE_CONCEPT_LINK, {
    update: createConceptLinkUpdate(courseAndPrerequisites.id, workspaceId)
  })

  const linkConcepts = (from, to, checked) => async () => {

    if (!checked) {
      try {
        createConceptLink({
          variables: {
            from: from.id, to: to.id, workspaceId
          },
          optimisticResponse: {
            __typename: 'Mutation',
            createConceptLink: {
              id: `${Math.random() * 100}`,
              official: false,
              __typename: 'ConceptLink',
              to: {
                __typename: 'Concept',
                id: to.id
              },
              from: {
                __typename: 'Concept',
                id: from.id
              }
            }
          }
        })
      } catch (err) { return }
    } else {
      try {
        const link = from.linksFromConcept.find(link => {
          return link.to.id === to.id
        })
        deleteConceptLink({
          variables: {
            id: link.id
          },
          optimisticResponse: {
            __typename: 'Mutation',
            deleteConceptLink: {
              id: link.id,
              __typename: 'ConceptLink'
            }
          }
        })
      } catch (err) { return }
    }

  }

  const Cell = ({ columnIndex, data, rowIndex, style }) => {
    const { columnData, rowData } = data
    const isPrerequisite = columnData[columnIndex].linksFromConcept.find(l =>
      l.to.id === rowData[rowIndex].id
    )
    const checked = isPrerequisite !== undefined
    return (
      <div style={style} key={`${rowData[rowIndex].id}-${columnIndex}-${columnData[columnIndex]}`}>
        <GridCell
          onClick={
            linkConcepts(columnData[columnIndex], rowData[rowIndex], checked)
          }
          onHover={
            () => {
              document.getElementById(`course-matrix-row-${rowIndex}`).classList.add('bold')
              document.getElementById(`course-matrix-col-${columnIndex}`).classList.add('bold')
            }
          }
          onMouseLeave={
            () => {
              document.getElementById(`course-matrix-row-${rowIndex}`).classList.remove('bold')
              document.getElementById(`course-matrix-col-${columnIndex}`).classList.remove('bold')
            }
          }
          checked={checked}
        />
      </div>
    )
  }


  const filteredPrerequisiteConcepts = () => {
    const filteredConcepts = allPrerequisiteConcepts.filter(c =>
      c.name.toLowerCase().includes(filter)
    )
    return filteredConcepts
  }

  return (
    <Grid container direction='row'>
      <Grid item xs={4} lg={3} xl={2}>
        <div style={{ padding: '20px' }}>
          <form onSubmit={(e) => {
            e.preventDefault()
            setFilter(e.target.filter.value.toLowerCase())
          }}>
            <TextField
              margin='dense'
              id='description'
              label='Filter'
              type='text'
              name='filter'
              fullWidth
              variant='outlined'
            />
            <Button variant='contained' type='submit' fullWidth> Filter </Button>
          </form>
        </div>
      </Grid>

      <Grid item xs={8} lg={9} xl={10}>
        <FixedSizeGrid
          id='headerGrid'
          // standard grid setup for the header grid
          columnCount={filteredPrerequisiteConcepts().length}
          rowCount={1}
          columnWidth={columnWidth}
          rowHeight={rowHeight}
          height={headerHeight}
          width={dimensions.width - 120}
          // hold onto a reference to the header grid component
          // so we can set the scroll position later
          ref={headerGrid}
          // hide the overflow so the scroll bar never shows
          // in the header grid
          style={{
            overflowX: 'hidden',
            overflowY: 'hidden'
            // borderBottom: `1px solid gray`,
          }}
          itemData={filteredPrerequisiteConcepts()}
        >
          {HeaderCell}
        </FixedSizeGrid>
      </Grid>

      <Grid item xs={4} lg={3} xl={2}>
        <FixedSizeGrid
          id='sideGrid'
          // standard grid setup for the header grid
          columnCount={1}
          rowCount={rowCount}
          columnWidth={columnWidth}
          rowHeight={rowHeight}
          height={height}
          width={sideHeaderWidth}
          // hold onto a reference to the header grid component
          // so we can set the scroll position later
          ref={sideGrid}
          // hide the overflow so the scroll bar never shows
          // in the header grid
          style={{
            overflowX: 'hidden',
            overflowY: 'hidden'
            // backgroundColor: 'lightgray',
            // borderBottom: `1px solid gray`,
          }}
          direction='rtl'
          itemData={courseAndPrerequisites.concepts}
        >
          {RowHeaderCell}
        </FixedSizeGrid>
      </Grid>

      <Grid item xs={8} lg={9} xl={10}>
        <FixedSizeGrid
          // standard grid setup for the body grid
          columnCount={filteredPrerequisiteConcepts().length}
          rowCount={rowCount}
          columnWidth={columnWidth}
          rowHeight={rowHeight}
          height={height}
          width={dimensions.width - 120}
          // When a scroll occurs in the body grid,
          // synchronize the scroll position of the header grid
          onScroll={({ scrollLeft, scrollTop }) => {
            headerGrid.current.scrollTo({ scrollLeft })
            sideGrid.current.scrollTo({ scrollTop })
          }}
          itemData={{
            columnData: allPrerequisiteConcepts,
            rowData: courseAndPrerequisites.concepts
          }}
        >
          {Cell}
        </FixedSizeGrid>
      </Grid>
    </Grid>
  )
}

export default CourseMatrix
