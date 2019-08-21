import React, { useEffect, useState, useRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Button, Slider, FormGroup, FormControlLabel, FormControl, FormLabel, Checkbox
} from '@material-ui/core'
import cytoscape from 'cytoscape'
import klay from 'cytoscape-klay'
import popper from 'cytoscape-popper'
import Tippy from 'tippy.js'

import {
  WORKSPACE_DATA_FOR_GRAPH
} from '../../graphql/Query'
import client from '../../apollo/apolloClient'
import colors from './hexcolors'
import NotFoundView from '../error/NotFoundView'
import LoadingBar from '../../components/LoadingBar'

cytoscape.use(klay)
cytoscape.use(popper)

const useStyles = makeStyles({
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
    zIndex: 10
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
  }
})

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
    edgeSpacingFactor: 2.5, // Factor by which the object spacing is multiplied to arrive at the minimal spacing between edges.
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
    spacing: 35, // Overall setting for the minimal amount of space to be left between objects
    thoroughness: 12 // How much effort should be spent to produce a nice layout..
  },
  priority: edge => null // Edges with a non-nil value are skipped when geedy edge cycle breaking is enabled
}
/* eslint-enable max-len, no-unused-vars */

const sliderMinLinear = 0
const sliderMaxLinear = 100

const sliderMinLog = Math.log(0.05)
const sliderMaxLog = Math.log(5)

const sliderScale = (sliderMaxLog - sliderMinLog) / (sliderMaxLinear - sliderMinLinear)

const linearToLog = position => Math.exp(sliderMinLog + sliderScale * (position - sliderMinLinear))
const logToLinear = value => (Math.log(value) - sliderMinLog) / sliderScale + sliderMinLinear

const GraphView = ({ workspaceId }) => {
  const classes = useStyles()
  const [nextMode, redraw] = useState('courses')
  const [zoom, setZoom] = useState(20)
  const [error, setError] = useState(null)
  const [legendFilter, setLegendFilter] = useState([])
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
              gradient: `${courseMap[conceptLink.from.courses[0].id].color.bg} ${course.color.bg}`
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
      elements: [].concat(cur.conceptNodes, cur.conceptEdges, cur.courseNodes, cur.courseEdges),
      minZoom: 0.05,
      maxZoom: 5,
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'shape': 'round-rectangle',
            'width': 'label',
            'height': 'label',
            'background-color': 'data(color)',
            'text-wrap': 'wrap',
            'text-max-width': '200px',
            'text-valign': 'center',
            'padding': '10px',
            'display': 'data(display)'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 5,
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
            'width': 8,
            'mid-target-arrow-color': 'data(color)',
            'line-fill': 'linear-gradient',
            'line-gradient-stop-colors': 'data(gradient)'
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
    loadingRef.current.componentWillUnmount()
    controlsRef.current.style.display = 'block'

    cur.conceptLayout.run()
  }

  useEffect(() => {
    (async () => {
      try {
        const response = await client.query({
          query: WORKSPACE_DATA_FOR_GRAPH,
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
  }, [])

  if (error) {
    return <NotFoundView message='Workspace not found' />
  }

  return <div className={classes.root}>
    <div className={classes.graph} ref={graphRef}>
      {!state.current.network && <LoadingBar id='graph-view' componentRef={loadingRef} />}
    </div>
    <div ref={controlsRef} style={{ display: state.current.network ? 'block' : 'none' }}>
      <div className={classes.buttonWrapper}>
        <Button className={classes.button} variant='outlined' color='primary' onClick={toggleMode}>
          Switch to {nextMode}
        </Button>
        <Button className={classes.button} variant='outlined' color='primary' onClick={resetLayout}>
          Reset layout
        </Button>
        <Button className={classes.button} variant='outlined' color='primary' onClick={resetZoom}>
          Reset zoom
        </Button>
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
          })} />
      </div>
      {state.current.courseLegend && nextMode === 'courses' &&
        <div className={classes.legendWrapper}>
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
  </div>
}

export default GraphView
