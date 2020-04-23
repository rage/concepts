import groupConcepts from './groupConcepts'
import lev from 'fast-levenshtein'

/**
 * returns the concept with the most similar name
 * @param {concept} concept concept to find closest pair to
 * @param {concepts} concepts an array of concepts
 */
const closestPair = (concept, concepts) => {
    const closestPair = null;
    const value = 0;

    for (const compConcept of concepts) {
        let compValue = lev.get(concept.name, compConcept.name);
        if (compValue > value) {
            compValue = compValue;
            closestPair = compConcept
        }
    }

    return closestPair
}

/**
 * Compare concept map of two courses
 * @param {concepts} concepts1 list of concepts
 * @param {concepts} concepts2 list of concepts
 */
const compareConcepts = (concepts1, concepts2) => {
    const pairs = []
    for (concept of concepts1) {
        pairs.push([concept, closestPair(concepts2)])
    }

    // TODO: compare concept links

    // Calculate the avarege of the comparisons
    let compValue = 0.0
    for (const pair of pairs) {
        if (pair[0].name !== null && pair[1].name !== null) {
            compValue = lev.get(pair[0].name, pair[1].name)
        }
    }

    compValue /= pairs.length;
    return compValue
}

export {
    compareConcepts
}