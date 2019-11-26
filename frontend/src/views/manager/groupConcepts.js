import lev from 'fast-levenshtein'

const MAGIC_NUMBER = 0.6

const groupConcepts = (concepts) => {
  const result = []
  const used = []
  let resultIndex = 0
  for (let i = 0; i < concepts.length; i++) {
    if (used[i]) continue
    const threshold = concepts[i].name.length * MAGIC_NUMBER
    result[resultIndex] = []
    for (let j = i; j < concepts.length; j++) {
      if (!used[j] && lev.get(concepts[i].name, concepts[j].name) < threshold) {
        used[j] = true
        result[resultIndex].push(concepts[j])
      }
    }
    resultIndex++
  }
  return result
}

export default groupConcepts
