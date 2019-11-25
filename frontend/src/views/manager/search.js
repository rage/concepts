import Fuse from 'fuse.js'

const options = {
  shouldSort: true,
  threshold: 0.6,
  location: 0,
  distance: 100,
  minPatternLength: 32,
  minMatchCharLength: 1,
  keys: [
    'name',
    'description',
    'tags'
  ]
}

export const searchConcepts = (list, filter) => {
  const fuse = new Fuse(list, options)
  return fuse.search(filter)
}
