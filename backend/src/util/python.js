export function* zip(arr1, arr2) {
  const min = Math.min(arr1.length, arr2.length)
  for (let i = 0; i < min; i++) {
    yield [arr1[i], arr2[i]]
  }
}

zip.prototype.map = function(fn) {
  const data = []
  let next = { value: undefined, done: false }
  let index = 0
  while (!next.done) {
    next = this.next()
    data.push(fn(next.value, index, this))
    index++
  }
  return data
}
