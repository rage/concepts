export const noPropagation = func => (evt, ...args) => {
  evt.stopPropagation()
  return func(evt, ...args)
}

export const noDefault = func => (evt, ...args) => {
  evt.preventDefault()
  return func(evt, ...args)
}
