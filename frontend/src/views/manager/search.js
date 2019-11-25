import { get } from "../../lib/objectRecursion"

const keyRegex = /^([a-z.]+):(.*)$/

/**
 * Split a filter string into parts.
 *
 * @param {string} filter The string filter parameter
 * @returns {[{
 *  text: string,
 *  quote: boolean,
 *  additive: boolean,
 *  key: string?
 * }]} The array of parts in the filter.
 */
const parseFilter = filter => {
  let quote = null
  const building = []
  const result = []
  const build = () => {
    if (building.length === 0) {
      return
    }
    const data = {
      // The text in the filter part
      text: building.join('').toLowerCase(),
      // Whether or not the filter part was quoted
      quote: quote !== null,
      // Whether the filter is additive (only concepts matching should be included)
      // or not (concepts matching should be excluded)
      additive: true,
      // The key to apply this filter to. Can be used e.g. to search for a specific tag.
      key: null,
    }
    if (data.text[0] === '+' || data.text[0] === '-') {
      data.additive = data.text[0] === '+'
      data.text = data.text.substr(1)
    }
    const keyData = data.text.match(keyRegex)
    if (keyData) {
      data.key = keyData[1]
      data.text = keyData[2]
    }
    result.push(data)
    quote = null
    building.length = 0
  }
  for (const char of filter.split("")) {
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
 * @param {{
 *  text: string,
 *  quote: boolean,
 *  additive: boolean,
 *  key: string?
 * }} part The filter part from parseFilter.
 * @returns {boolean} Whether or not the part is a match.
 */
const matchPart = (concept, part) => {
  if (part.key) {
    const value = get(concept, part.key)
    if (!value) {
      return !part.additive
    } else if (Array.isArray(value)) {
      return part.additive === Boolean(value.find(item => (item.name || item).toLowerCase().startsWith(part.text)))
    } else {
      return part.additive === value.toLowerCase().startsWith(part.text)
    }
  } else {
    // TODO we should do fuzzy matching here when part.quote is false
    return part.additive === (
        concept.name.toLowerCase().includes(part.text)
        || concept.description.toLowerCase().includes(part.text))
  }
}

export const searchConcepts = (list, filter) => {
  const parts = parseFilter(filter)
  return list.filter(concept => parts.find(part => matchPart(concept, part) === false) === undefined)
}
