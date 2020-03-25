const findStronglyConnectedComponents = (nodes, edges) => {
  let index = 0
  const stack = []
  const sccs = []

  const nodeMap = new Map(nodes.map(node => [node.data.id, node]))
  for (const node of nodes) {
    node.tarjan = {
      successors: []
    }
  }
  for (const edge of edges) {
    const from = nodeMap.get(edge.data.source)
    const to = nodeMap.get(edge.data.target)
    from.tarjan.successors.push(to)
  }

  const strongConnect = node => {
    node.tarjan.index = node.tarjan.lowLink = index++
    stack.push(node)
    node.tarjan.onStack = true

    for (const successor of node.tarjan.successors) {
      if (!successor.tarjan.index) {
        strongConnect(successor)
        node.tarjan.lowLink = Math.min(node.tarjan.lowLink, successor.tarjan.lowLink)
      } else if (successor.tarjan.onStack) {
        node.tarjan.lowLink = Math.min(node.tarjan.lowLink, successor.tarjan.index)
      }
    }

    if (node.tarjan.lowLink === node.tarjan.index) {
      const scc = []
      let w
      do {
        w = stack.pop()
        w.tarjan.onStack = false
        scc.push(w)
      } while (w && w !== node)
      if (scc.length > 1) {
        sccs.push(scc)
      }
    }
  }

  for (const node of nodes) {
    if (!node.tarjan.index) {
      strongConnect(node)
    }
  }

  return sccs
}

export default findStronglyConnectedComponents
