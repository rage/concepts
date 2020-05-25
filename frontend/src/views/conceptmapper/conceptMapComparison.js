import lev from 'fast-levenshtein'

const WORD_LENGTH = 0.8

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
 * Return true if the pair is a match e.g. exceeds the treshold
 * @param {Object} pair Pair from closestPair function
 */
const isMatch = (pair) => {
    if (pair.concept == null || pair.closestPair == null) return false
    const treshold =  Math.min(pair.concept.name.length, pair.closestPair.name.length) * WORD_LENGTH
    return treshold > pair.value
}

/**
 * Compare concept map of two courses
 * @param {concepts} concepts1 list of concepts
 * @param {concepts} concepts2 list of concepts
 */
const compareConcepts = (concepts1, concepts2) => {
    const pairs = []
    const matches = []

    for (const concept of concepts1) {
        pairs.push(closestPair(concept, concepts2))
    }

    // TODO: compare concept links

    // Calculate the avarege of the comparisons
    let avgDistance = 0.0
    for (const pair of pairs) {
        if (isMatch(pair)) {
            matches.push(pair)
        }

        const { closestPair, value } = pair
        if (closestPair !== null) {
            avgDistance += value
        }
    }

    avgDistance /= pairs.length;
    const percentage = (matches.length / pairs.length) * 100
    return { avgDistance, percentage, matches }
}

export {
    compareConcepts,
    closestPair
}