const keyRegex = /^([a-z.]+):(.*)$/
const knownKeys = new Set(['tag', 'tags'])

/**
 * A part of a parsed filter
 * @typedef {Object} FilterPart
 * @property {string}  text     The text in the filter
 * @property {boolean} quote    Whether or not the filter part was quoted
 * @property {boolean} additive Whether the filter is additive (only concepts matching should
 *                              be included) or not (concepts matching should be excluded)
 * @property {string}  [key]    The key for filtering by a specific concept field.
 */

/**
 * Split a filter string into parts.
 *
 * @param {string} filter The string filter parameter
 * @returns {[FilterPart]} The array of parts in the filter.
 */
export const parseFilter = filter => {
  let quote = null
  const building = []
  const result = []
  const build = () => {
    if (building.length === 0) {
      return
    }
    const data = {
      text: building.join('').toLowerCase(),
      quote: quote !== null,
      additive: true,
      key: null
    }
    if (data.text[0] === '+' || data.text[0] === '-') {
      data.additive = data.text[0] === '+'
      data.text = data.text.substr(1)
    }
    const keyData = data.text.match(keyRegex)
    if (keyData && knownKeys.has(keyData[1])) {
      data.key = keyData[1]
      data.text = keyData[2]
    }
    result.push(data)
    quote = null
    building.length = 0
  }
  for (const char of filter.split('')) {
    if (char === quote || (char === ' ' && !quote)) build()
    else if (!quote && (char === '"' || char === "'")) quote = char
    else building.push(char)
  }
  build()
  return result
}

/**
 * Check if the given concept should be shown when filtering with the given filter part.
 *
 * @param {Concept} concept The concept to match.
 * @param {FilterPart} part The filter part from parseFilter.
 * @returns {boolean} Whether or not the part is a match.
 */
const matchPart = (concept, part) => {
  switch (part.key) {
  case 'tags':
  case 'tag':
    return part.additive === Boolean(concept.tags
      .find(tag => tag.name.toLowerCase().startsWith(part.text)))
  case null:
    // TODO we should do fuzzy matching here when part.quote is false
    return part.additive === (
      concept.name.toLowerCase().includes(part.text)
          || concept.description?.toLowerCase().includes(part.text))
  default:
    console.warn('Unknown part key', part.key)
    return !part.additive
  }
}

export const includeConcept = (concept, filter) =>
  filter.find(part => matchPart(concept, part) === false) === undefined

export default {
  parse: parseFilter,
  include: includeConcept
}
