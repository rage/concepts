import lev from 'fast-levenshtein'

/**
 * Group concepts
 * @param {concept} Array containing concepts in groups
 */
const groupConcepts = (conceptList, treshold = 5) => {
  const result = []
  const used = []
  for (var i = 0; i < conceptList.length; i++) {
    if (used[i]) continue
    const list = []
    for (var j = i; j < conceptList.length; j++) {
      if (!used[j] && lev.get(conceptList[i].name, conceptList[j].name) < treshold) {
        used[j] = true
        list.push(conceptList[j])
      }
    }
    result.push(list)
  }
  return result
}

export default groupConcepts
