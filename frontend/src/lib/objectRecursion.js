const simpleSingleSplit = (str, separator) => {
  const index = str.indexOf(separator)
  if (index === -1) {
    return [str, null]
  }
  return [str.slice(0, index), str.substr(index + 1)]
}

const parsePathPart = (obj, key) => {
  if (!obj) {
    return undefined
  }
  const openingBracket = key.indexOf('[')
  if (openingBracket >= 0 && key.endsWith(']')) {
    if (openingBracket > 0) {
      const preKey = key.substr(0, openingBracket)
      if (!obj.hasOwnProperty(preKey)) {
        return undefined
      }
      obj = obj[preKey]
    }
    key = key.slice(openingBracket + 1, -1)
    const [path, expectedValue] = simpleSingleSplit(key, '=')
    if (expectedValue !== null) {
      return obj.find(data => get(data, path) === expectedValue)
    }
  } else if (!obj.hasOwnProperty(key)) {
    return undefined
  }
  return obj[key]
}

const parsePath = (obj, path) => {
  const parts = path.split('.')
  const key = parts.pop()
  const pointer = parts.reduce(parsePathPart, obj)
  return [pointer, key]
}

export const get = (obj, path) => {
  const [pointer, key] = parsePath(obj, path)
  return pointer?.[key]
}

export const appendArray = (obj, path, value) => {
  const [pointer, key] = parsePath(obj, path)
  if (pointer) {
    pointer[key] = [...pointer[key], value]
  }
  return obj
}

export const filterArray = (obj, path, filterMethod) => {
  const [pointer, key] = parsePath(obj, path)
  if (pointer) {
    pointer[key] = pointer[key].filter(filterMethod)
  }
  return obj
}
