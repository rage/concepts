export const arrayShiftMutate = (array, from, to) => {
  array.splice(to < 0 ? array.length + to : to, 0, array.splice(from, 1)[0])
  return array
}

const arrayShift = (array, from, to) => arrayShiftMutate(array.slice(), from, to)

export default arrayShift
