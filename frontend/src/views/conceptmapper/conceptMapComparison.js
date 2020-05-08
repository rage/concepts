import lev from 'fast-levenshtein'

/**
 * returns the concept with the most similar name
 * @param {concept} concept concept to find closest pair to
 * @param {concepts} concepts an array of concepts
 */
const closestPair = (concept, concepts) => {
    let closestPair = null
    let value = 999

    for (const compConcept of concepts) {
        const compValue = lev.get(concept.name, compConcept.name)
        if (compValue < value) {
            value = compValue
            closestPair = compConcept
        }
    }

    return { concept, closestPair, value }
}

/**
 * Compare concept map of two courses
 * @param {concepts} concepts1 list of concepts
 * @param {concepts} concepts2 list of concepts
 */
const compareConcepts = (concepts1, concepts2) => {
    const pairs = []
    for (const concept of concepts1) {
        pairs.push(closestPair(concept, concepts2))
    }

    // TODO: compare concept links

    // Calculate the avarege of the comparisons
    let compValue = 0.0
    for (const pair of pairs) {
        const { closestPair, value } = pair
        if (closestPair !== null) {
            compValue += value
        }
    }

    compValue /= pairs.length;
    return compValue
}

export {
    compareConcepts,
    closestPair
}