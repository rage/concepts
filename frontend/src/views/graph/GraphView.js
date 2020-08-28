import React, { useEffect, useState, useRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Button, TextField, Slider, InputAdornment,
  FormGroup, FormControlLabel, FormControl, FormLabel, Checkbox, Typography, Tooltip
} from '@material-ui/core'
import { Warning as WarningIcon, FilterList as FilterListIcon, FilterList } from '@material-ui/icons'
import cytoscape from 'cytoscape'
import klay from 'cytoscape-klay'
import popper from 'cytoscape-popper'
import Tippy from 'tippy.js'

import {
  WORKSPACE_COURSES_AND_CONCEPTS
} from '../../graphql/Query'
import client from '../../apollo/apolloClient'
import cache from '../../apollo/update'
import colors from './hexcolors'
import NotFoundView from '../error/NotFoundView'
import LoadingBar from '../../components/LoadingBar'
import { useInfoBox } from '../../components/InfoBox'
import {
  useManyUpdatingSubscriptions,
  useUpdatingSubscription
} from '../../apollo/useUpdatingSubscription'
import { getTagColor } from '../../dialogs/tagSelectUtils'
import findStronglyConnectedComponents from './tarjan'

cytoscape.use(klay)
cytoscape.use(popper)

const useStyles = makeStyles(theme => ({
  root: {
    gridArea: 'content',
    overflow: 'hidden'
  },
  graph: {
    width: '100%',
    height: '100%'
  },
  button: {
    '&:not(:last-of-type)': {
      marginRight: '10px'
    }
  },
  buttonWrapper: {
    top: '60px',
    left: '10px',
    position: 'absolute',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center'
  },
  sliderWrapper: {
    top: '110px',
    left: '10px',
    height: '300px',
    position: 'absolute',
    zIndex: 10
  },
  legendWrapper: {
    top: '60px',
    right: '10px',
    position: 'absolute',
    zIndex: 10
  },
  noLinksWrapper: {
    position: 'absolute',
    left: '50%',
    top: '40%'
  },
  noLinksMessage: {
    width: '260px',
    marginLeft: '-140px'
  },
  tooltip: {
    backgroundColor: 'white',
    color: 'rgba(0, 0, 0, 0.87)',
    boxShadow: theme.shadows[1],
    fontSize: 16,
    margin: '2px'
  },
  popper: {
    padding: '5px'
  }
}))

/* eslint-disable max-len, no-unused-vars */
const options = {
  nodeDimensionsIncludeLabels: true, // Boolean which changes whether label dimensions are included when calculating node dimensions
  fit: true, // Whether to fit
  padding: 100, // Padding on fit
  animate: false, // Whether to transition the node positions
  animateFilter: (node, i) => true, // Whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions
  animationDuration: 500, // Duration of animation in ms if enabled
  animationEasing: undefined, // Easing of animation if enabled
  transform: (node, pos) => pos, // A function that applies a transform to the final node position
  ready: undefined, // Callback on layoutready
  stop: undefined, // Callback on layoutstop
  klay: {
    // Following descriptions taken from http://layout.rtsys.informatik.uni-kiel.de:9444/Providedlayout.html?algorithm=de.cau.cs.kieler.klay.layered
    addUnnecessaryBendpoints: false, // Adds bend points even if an edge does not change direction.
    aspectRatio: 1.6, // The aimed aspect ratio of the drawing, that is the quotient of width by height
    borderSpacing: 20, // Minimal amount of space to be left to the border
    compactComponents: false, // Tries to further compact components (disconnected sub-graphs).
    crossingMinimization: 'LAYER_SWEEP', // Strategy for crossing minimization.
    /* LAYER_SWEEP The layer sweep algorithm iterates multiple times over the layers, trying to find node orderings that minimize the number of crossings. The algorithm uses randomization to increase the odds of finding a good result. To improve its results, consider increasing the Thoroughness option, which influences the number of iterations done. The Randomization seed also influences results.
    INTERACTIVE Orders the nodes of each layer by comparing their positions before the layout algorithm was started. The idea is that the relative order of nodes as it was before layout was applied is not changed. This of course requires valid positions for all nodes to have been set on the input graph before calling the layout algorithm. The interactive layer sweep algorithm uses the Interactive Reference Point option to determine which reference point of nodes are used to compare positions. */
    cycleBreaking: 'GREEDY', // Strategy for cycle breaking. Cycle breaking looks for cycles in the graph and determines which edges to reverse to break the cycles. Reversed edges will end up pointing to the opposite direction of regular edges (that is, reversed edges will point left if edges usually point right).
    /* GREEDY This algorithm reverses edges greedily. The algorithm tries to avoid edges that have the Priority property set.
    INTERACTIVE The interactive algorithm tries to reverse edges that already pointed leftwards in the input graph. This requires node and port coordinates to have been set to sensible values.*/
    direction: 'DOWN', // Overall direction of edges: horizontal (right / left) or vertical (down / up)
    /* UNDEFINED, RIGHT, LEFT, DOWN, UP */
    edgeRouting: 'ORTHOGONAL', // Defines how edges are routed (POLYLINE, ORTHOGONAL, SPLINES)
    edgeSpacingFactor: 1.5, // Factor by which the object spacing is multiplied to arrive at the minimal spacing between edges.
    feedbackEdges: false, // Whether feedback edges should be highlighted by routing around the nodes.
    fixedAlignment: 'NONE', // Tells the BK node placer to use a certain alignment instead of taking the optimal result.  This option should usually be left alone.
    /* NONE Chooses the smallest layout from the four possible candidates.
    LEFTUP Chooses the left-up candidate from the four possible candidates.
    RIGHTUP Chooses the right-up candidate from the four possible candidates.
    LEFTDOWN Chooses the left-down candidate from the four possible candidates.
    RIGHTDOWN Chooses the right-down candidate from the four possible candidates.
    BALANCED Creates a balanced layout from the four possible candidates. */
    inLayerSpacingFactor: 2.5, // Factor by which the usual spacing is multiplied to determine the in-layer spacing between objects.
    layoutHierarchy: true, // Whether the selected layouter should consider the full hierarchy
    linearSegmentsDeflectionDampening: 0.3, // Dampens the movement of nodes to keep the diagram from getting too large.
    mergeEdges: false, // Edges that have no ports are merged so they touch the connected nodes at the same points.
    mergeHierarchyCrossingEdges: true, // If hierarchical layout is active, hierarchy-crossing edges use as few hierarchical ports as possible.
    nodeLayering: 'NETWORK_SIMPLEX', // Strategy for node layering.
    /* NETWORK_SIMPLEX This algorithm tries to minimize the length of edges. This is the most computationally intensive algorithm. The number of iterations after which it aborts if it hasn't found a result yet can be set with the Maximal Iterations option.
    LONGEST_PATH A very simple algorithm that distributes nodes along their longest path to a sink node.
    INTERACTIVE Distributes the nodes into layers by comparing their positions before the layout algorithm was started. The idea is that the relative horizontal order of nodes as it was before layout was applied is not changed. This of course requires valid positions for all nodes to have been set on the input graph before calling the layout algorithm. The interactive node layering algorithm uses the Interactive Reference Point option to determine which reference point of nodes are used to compare positions. */
    nodePlacement: 'BRANDES_KOEPF', // Strategy for Node Placement
    /* BRANDES_KOEPF Minimizes the number of edge bends at the expense of diagram size: diagrams drawn with this algorithm are usually higher than diagrams drawn with other algorithms.
    LINEAR_SEGMENTS Computes a balanced placement.
    INTERACTIVE Tries to keep the preset y coordinates of nodes from the original layout. For dummy nodes, a guess is made to infer their coordinates. Requires the other interactive phase implementations to have run as well.
    SIMPLE Minimizes the area at the expense of... well, pretty much everything else. */
    randomizationSeed: 1, // Seed used for pseudo-random number generators to control the layout algorithm; 0 means a new seed is generated
    routeSelfLoopInside: false, // Whether a self-loop is routed around or inside its node.
    separateConnectedComponents: true, // Whether each connected component should be processed separately
    spacing: 20, // Overall setting for the minimal amount of space to be left between objects
    thoroughness: 15 // How much effort should be spent to produce a nice layout..
  },
  priority: edge => null // Edges with a non-nil value are skipped when geedy edge cycle breaking is enabled
}
/* eslint-enable max-len, no-unused-vars */

const sliderMinLinear = 0
const sliderMaxLinear = 100

const sliderMinLog = Math.log(0.05)
const sliderMaxLog = Math.log(5)

const sliderScale = (sliderMaxLog - sliderMinLog) / (sliderMaxLinear - sliderMinLinear)

const linearToLog = position =>
  Math.exp(sliderMinLog + (sliderScale * (position - sliderMinLinear)))
const logToLinear = value =>
  ((Math.log(value) - sliderMinLog) / sliderScale) + sliderMinLinear

const GraphView = ({ workspaceId }) => {
  const classes = useStyles()
  const [nextMode, redraw] = useState('courses')
  const [zoom, setZoom] = useState(20)
  const [error, setError] = useState(null)
  const [cycles, setCycles] = useState(0)
  const [cycleJump, setCycleJump] = useState(0)
  const [edgesMissing, setEdgesMissing] = useState({
    course: false,
    concept: false
  })
  const [legendFilter, setLegendFilter] = useState([])
  const [refresh, setRefresh] = useState(false)
  const state = useRef({
    network: null,
    nodes: null,
    edges: null,
    conceptEdges: null,
    courseEdges: null,
    conceptNodes: null,
    courseNodes: null,
    courseLegend: null,
    mode: 'concepts',
    courseLayout: null,
    conceptLayout: null
  })

  const postUpdate = () => setRefresh(true)

  useUpdatingSubscription('workspace', 'update', {
    variables: { workspaceId },
    postUpdate
  })

  useManyUpdatingSubscriptions(
    ['course', 'concept'],
    ['create', 'delete', 'update'],
    { variables: { workspaceId }, postUpdate }

  )

  useUpdatingSubscription('concept link', 'delete', {
    variables: { workspaceId },
    update: cache.deleteConceptLinkRecursiveUpdate(workspaceId),
    postUpdate
  })

  useUpdatingSubscription('concept link', 'create', {
    variables: { workspaceId },
    update: cache.createConceptLinkRecursiveUpdate(workspaceId),
    postUpdate
  })

  const redrawEverything = () => {
    const data = client.readQuery({
      query: WORKSPACE_COURSES_AND_CONCEPTS,
      variables: { id: workspaceId }
    })
    drawConceptGraph(data)
    setRefresh(false)
  }

  const loadingRef = useRef(null)
  const controlsRef = useRef(null)
  const graphRef = useRef(null)

  const toggleMode = () => {
    const cur = state.current
    const oldMode = cur.mode
    cur.mode = nextMode

    cur.network.startBatch()
    if (cur.mode === 'concepts') {
      for (const course of legendFilter) {
        cur.network.elements(`[type="concept"][courseId="${course}"]`).style('display', 'element')
      }
    } else {
      cur.network.elements('[type="concept"]').style('display', 'none')
    }

    cur.network.elements('[type="course"]').style('display',
      cur.mode === 'courses' ? 'element' : 'none')
    cur.network.endBatch()

    resetLayout()
    redraw(oldMode)
  }

  const adjust = fn => {
    state.current.network.startBatch()
    fn(state.current.network)
    state.current.network.endBatch()
  }

  const toggleLegendFilter = evt => {
    if (evt.target.checked) {
      setLegendFilter(legendFilter.concat(evt.target.value))
      adjust(cy => cy.elements(`[courseId="${evt.target.value}"]`).style('display', 'element'))
    } else {
      setLegendFilter(legendFilter.filter(val => val !== evt.target.value))
      adjust(cy => cy.elements(`[courseId="${evt.target.value}"]`).style('display', 'none'))
    }
  }

  const resetLayout = () => state.current[`${state.current.mode.slice(0, -1)}Layout`].run()
  const resetZoom = () => state.current.network.fit([], 100)

  const jumpToCycle = () => {
    if (cycles === 0) {
      return
    }
    // The cycle ID is 1..n rather than 0..n-1
    const newCycleJump = (cycleJump % cycles) + 1
    state.current.network.fit(state.current.network.$(`#cycle-${newCycleJump}`), 250)
    setCycleJump(newCycleJump)
  }

  const drawPaths = evt => {
    const cur = state.current
    cur.network.startBatch()
    const selectedNodes = evt.cy.nodes().filter(ele => ele.selected())
    selectedNodes.addClass('highlight').predecessors().addClass('highlight')
    selectedNodes.successors().addClass('highlight')
    cur.network.endBatch()
  }

  const clearPaths = evt => {
    const cur = state.current
    if (evt.target === cur.network) {
      cur.network.startBatch()
      evt.cy.elements().removeClass('highlight')
      cur.network.endBatch()
    }
  }

  const drawConceptGraph = data => {
    const cur = state.current
    cur.conceptNodes = []
    cur.conceptEdges = []
    cur.courseNodes = []
    cur.courseEdges = []
    const courseMap = Object.fromEntries(data.workspaceById.courses
      .map((course, index) => {
        course.color = colors[index]
        return [course.id, course]
      }))

    for (const course of data.workspaceById.courses) {
      for (const concept of course.concepts) {
        cur.conceptNodes.push({
          group: 'nodes',
          data: {
            id: concept.id,
            label: concept.name,
            description: !concept.description ? 'No description available'
              : concept.description.replace('\n', '</br>'),
            color: course.color.bg,
            tags: concept.tags,
            type: 'concept',
            display: 'element',
            courseId: course.id
          }
        })

        for (const conceptLink of concept.linksToConcept) {
          cur.conceptEdges.push({
            group: 'edges',
            data: {
              id: conceptLink.from.id + concept.id,
              source: conceptLink.from.id,
              type: 'concept',
              display: 'element',
              target: concept.id,
              color: course.color.bg,
              courseId: course.id,
              gradient: `${courseMap[conceptLink.from.course.id].color.bg} ${course.color.bg}`
            }
          })
        }
      }

      cur.courseNodes.push({
        data: {
          shape: 'ellipse',
          id: course.id,
          label: course.name,
          type: 'course',
          display: 'none',
          color: course.color.bg
        }
      })

      // Get course nodes
      for (const courseLink of course.linksToCourse) {
        if (courseLink.from.id === course.id) {
          continue
        }
        cur.courseEdges.push({
          data: {
            id: courseLink.from.id + course.id,
            source: courseLink.from.id,
            type: 'course',
            display: 'none',
            target: course.id,
            color: course.color.bg,
            gradient: `${courseMap[courseLink.from.id].color.bg} ${course.color.bg}`
          }
        })
      }
    }

    cur.conceptNodes = cur.conceptNodes.filter(node =>
      cur.conceptEdges.find(edge =>
        edge.data.source === node.data.id || edge.data.target === node.data.id)
    )

    const sccs = findStronglyConnectedComponents(cur.conceptNodes, cur.conceptEdges)
    if (cycles !== sccs.length) {
      setCycles(sccs.length)
    }
    let cycleIndex = 0
    cur.cycles = []
    for (const scc of sccs) {
      cycleIndex += 1
      const cycleId = `cycle-${cycleIndex}`
      cur.cycles.push({
        group: 'nodes',
        data: {
          id: cycleId,
          type: 'cycle'
        }
      })
      for (const node of scc) {
        for (const node2 of scc) {
          node.data.parent = cycleId
          const edge = node.tarjan.edgeMap.get(node2.data.id)
          if (edge) {
            edge.classes = 'cycle'
          }
        }
      }
    }

    const legendIncludedCourses = cur.conceptNodes
      .map(node => node.data.courseId)
      .filter((id, index, arr) => arr.indexOf(id) === index)
    cur.courseLegend = cur.courseNodes
      .filter(node => legendIncludedCourses.includes(node.data.id))
      .map(node => node.data)
    setLegendFilter(cur.courseLegend.map(course => course.id))

    cur.courseNodes = cur.courseNodes.filter(node =>
      cur.courseEdges.find(edge =>
        edge.data.source === node.data.id || edge.data.target === node.data.id)
    )

    cur.network = cytoscape({
      container: graphRef.current,
      elements: [].concat(cur.conceptNodes, cur.conceptEdges, cur.courseNodes, cur.courseEdges,
        cur.cycles),
      minZoom: 0.05,
      maxZoom: 5,
      style: [
        {
          selector: 'node[type != "cycle"]',
          style: {
            label: 'data(label)',
            shape: 'round-rectangle',
            width: 'label',
            height: 'label',
            'background-color': 'data(color)',
            'text-wrap': 'wrap',
            'text-max-width': '200px',
            'text-valign': 'center',
            padding: '10px',
            display: 'data(display)'
          }
        },
        {
          selector: 'node[type = "cycle"]',
          style: {
            shape: 'round-rectangle',
            'background-color': '#FFAAAA',
            display: 'element'
          }
        },
        {
          selector: 'edge',
          style: {
            width: 5,
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'mid-target-arrow-shape': 'triangle'
          }
        },
        {
          selector: 'node.highlight',
          style: {
            'border-color': 'data(color)',
            'border-width': '4px'
          }
        },
        {
          selector: 'edge.highlight',
          style: {
            width: 8,
            'mid-target-arrow-color': 'data(color)',
            'line-fill': 'linear-gradient',
            'line-gradient-stop-colors': 'data(gradient)'
          }
        },
        {
          selector: 'edge.cycle',
          style: {
            'line-color': '#FF0000',
            'target-arrow-color': '#FF0000',
            'mid-target-arrow-color': '#FF0000'
          }
        }
      ]
    })
    cur.network.on('zoom', evt => setZoom(logToLinear(evt.cy.zoom())))
    cur.network.nodes().on('select', drawPaths)
    cur.network.elements().on('click', evt => evt.target.select())
    cur.network.on('click', clearPaths)

    // Add tooltip to concept nodes
    cur.network.nodes('node[type="concept"]').forEach(conceptNode => {
      const name = conceptNode.data('label')
      const tags = conceptNode.data('tags')
      const description = conceptNode.data('description')
      const nodeRef = conceptNode.popperRef()
      const tippy = new Tippy(nodeRef, {
        content: () => {
          const content = document.createElement('div')
          const title = document.createElement('h3')
          const desc = document.createElement('p')
          title.style.textAlign = 'left'
          title.style.marginTop = '0px'
          title.style.marginBottom = '0px'
          desc.style.textAlign = 'left'
          desc.style.marginTop = '5px'
          title.innerHTML = name
          desc.innerHTML = description
          content.appendChild(title)
          content.appendChild(desc)
          tags.forEach(tag => {
            const chip = document.createElement('span')
            chip.innerHTML = tag.name
            chip.style.padding = '4px 6px 4px 6px'
            chip.style.border = '1px solid'
            chip.style.borderRadius = '30px'
            chip.style.borderColor = getTagColor(tag)
            chip.style.color = getTagColor(tag)
            chip.style.margin = '0px 4px 0px 0px'
            content.appendChild(chip)
          })
          content.style.marginTop = '4px'
          content.style.marginBottom = '8px'
          return content
        },
        trigger: 'manual',
        duration: [0, 0],
        theme: 'light'
      })
      conceptNode.on('mouseover', () => tippy.show())
      conceptNode.on('mouseout', () => tippy.hide())
    })

    // Add tooltip to concept nodes
    cur.network.nodes('node[type="conceptNode"]').forEach(conceptNode => {
      const description = conceptNode.data('description')
      const nodeRef = conceptNode.popperRef()
      const tippy = new Tippy(nodeRef, {
        content: () => {
          const content = document.createElement('div')
          content.innerHTML = description
          return content
        },
        trigger: 'manual'
      })
      conceptNode.on('mouseover', () => tippy.show())
      conceptNode.on('mouseout', () => tippy.hide())
    })

    cur.conceptLayout = cur.network.layout({ ...options, name: 'klay' })
    cur.courseLayout = cur.network.layout({
      ...options,
      klay: {
        ...options.klay,
        direction: 'RIGHT',
        spacing: 50,
        edgeSpacingFactor: 0.5,
        inLayerSpacingFactor: 3.0,
        edgeRouting: 'POLYLINE'
      },
      name: 'klay'
    })
    loadingRef.current.stopLoading('graph-view')
    controlsRef.current.style.display = 'block'
    setEdgesMissing({
      concept: cur.conceptEdges?.length === 0,
      course: cur.courseEdges?.length === 0
    })
    cur.conceptLayout.run()
  }

  useEffect(() => {
    (async () => {
      try {
        const response = await client.query({
          query: WORKSPACE_COURSES_AND_CONCEPTS,
          variables: {
            id: workspaceId
          }
        })
        drawConceptGraph(response.data)
      } catch (err) {
        console.error(err)
        setError(err)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const infoBox = useInfoBox()

  useEffect(() => {
    infoBox.setView('graph')
    return () => infoBox.unsetView('graph')
  }, [infoBox])

  if (error) {
    return <NotFoundView message='Workspace not found' />
  }

  return <main className={classes.root}>
    <div className={classes.graph} ref={graphRef}>
      {!state.current.network &&
        <LoadingBar id='graph-view' componentRef={loadingRef} />
      }
    </div>
    <div className={classes.noLinksWrapper}>
      <Typography className={classes.noLinksMessage} variant='body1'>
        {nextMode === 'courses'
          ? edgesMissing.concept && 'No links between concepts.'
          : edgesMissing.course && 'No links between courses.'
        }
      </Typography>
      <Typography className={classes.noLinksMessage} variant='body1'>
        {nextMode === 'courses'
          ? edgesMissing.concept && 'Add connections to display graph.'
          : edgesMissing.course && 'Add connections to display graph.'
        }

      </Typography>
    </div>
    }
    <div ref={controlsRef} style={{ display: state.current.network ? 'block' : 'none' }}>
      <div className={classes.buttonWrapper}>
        <Button
          className={classes.button} variant='outlined' color='primary' onClick={toggleMode}
          ref={infoBox.ref('graph', 'SWITCH_TO_COURSES')}
        >
          Switch to {nextMode}
        </Button>
        <Button
          className={classes.button} variant='outlined' color='primary' onClick={resetLayout}
          ref={infoBox.ref('graph', 'RESET_LAYOUT')}
        >
          Reset layout
        </Button>
        <Button
          className={classes.button} variant='outlined' color='primary' onClick={resetZoom}
          ref={infoBox.ref('graph', 'RESET_ZOOM')}
        >
          Reset zoom
        </Button>
        <TextField 
          style={{ marginLeft: '8px' }} 
          placeholder="Filter..." 
          color='primary'
          onChange={evt => {
            evt.preventDefault()
            
            // Update graph with the keyword
            const value = evt.target.value
            const cur = state.current
            state.current.network.startBatch()
            cur.network.nodes(`node[type="${cur.mode.slice(0, -1)}"]`).forEach(conceptNode => {
              if (conceptNode.data("label").includes(value) || value === '') {
                conceptNode.style("display", "element")
              } else {
                conceptNode.style("display", "none")
              }
            })
            
            state.current.network.endBatch()
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FilterListIcon />
              </InputAdornment>
            ),
          }}
        />
        {cycles ? <Button
          className={classes.button} variant='outlined' color='secondary'
          onClick={jumpToCycle}
        >
          <WarningIcon color='secondary' />
          {cycles} cycles detected
        </Button> : null}
        {refresh &&
          <Tooltip
            key='refresh-graph'
            placement='bottom'
            classes={{
              tooltip: classes.tooltip,
              popper: classes.popper
            }}
            TransitionComponent={({ children }) => children || null}
            title='There are new changes to graph.'
          >
            <Button
              className={classes.button} variant='outlined' color='secondary'
              onClick={redrawEverything}
            >
              Refresh
            </Button>
          </Tooltip>
        }
      </div>
      <div className={classes.sliderWrapper}>
        <Slider
          orientation='vertical' value={zoom}
          onChange={(evt, newValue) => state.current.network.zoom({
            level: linearToLog(newValue),
            renderedPosition: {
              x: state.current.network.width() / 2,
              y: state.current.network.height() / 2
            }
          })}
          ref={infoBox.ref('graph', 'ZOOM')}
        />
      </div>
      {state.current.courseLegend && nextMode === 'courses' &&
        <div className={classes.legendWrapper} ref={infoBox.ref('graph', 'COURSE_FILTER')}>
          <FormControl>
            <FormLabel component='legend'>Courses</FormLabel>
            <FormGroup>
              {state.current.courseLegend.map(course => (
                <FormControlLabel
                  key={course.id}
                  control={<Checkbox
                    onChange={toggleLegendFilter}
                    value={course.id}
                    checked={legendFilter.includes(course.id)}
                    style={{ color: course.color }}
                  />}
                  label={course.label}
                />
              ))}
            </FormGroup>
          </FormControl>
        </div>
      }
    </div>
  </main>
}

export default GraphView
