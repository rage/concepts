const simpleSingleSplit = (str, separator) => {
  const index = str.indexOf(separator)
  if (index === -1) {
    return null
  }
  return [str.slice(0, index), str.substr(index + 1)]
}

const splitPath = path => path.split('.').flatMap(part => {
  if (part.endsWith(']')) {
    const start = part.indexOf('[')
    const subscriptPart = simpleSingleSplit(part.slice(start + 1, -1), '=')
    if (subscriptPart) {
      part = part.substr(0, start)
      return part.length > 0 ? [part, subscriptPart] : [subscriptPart]
    }
  }
  return [part]
})

const pathReducer = (obj, key) => {
  if (!obj) {
    return undefined
  }
  if (Array.isArray(key)) {
    const [path, expectedValue] = key
    return obj.find(data => get(data, path) === expectedValue)
  }
  return obj[key]
}

const pathRecurser = (obj, key, finalMutation) => {
  const part = key.shift()
  if (key.length === 0) {
    return finalMutation(obj, part)
  } else if (Array.isArray(part)) {
    const [path, expectedValue] = part
    const index = obj.findIndex(data => get(data, path) === expectedValue)
    obj[index] = pathRecurser(obj[index], key, finalMutation)
  } else {
    obj[part] = pathRecurser(obj[part], key, finalMutation)
  }
  return obj
}

export const get = (obj, path) => splitPath(path).reduce(pathReducer, obj)

export const push = (obj, path, value) => get(obj, path).push(value)

export const del = (obj, path) => pathRecurser(obj, splitPath(path), (obj, key) => {
  if (Array.isArray(key)) {
    const [path, expectedValue] = key
    obj = obj.filter(data => get(data, path) !== expectedValue)
  } else {
    delete obj[key]
  }
  return obj
})
