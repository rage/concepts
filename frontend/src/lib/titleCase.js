// eslint-disable-next-line no-extend-native
String.prototype.toTitleCase = function() {
  return this
    .split(' ')
    .map(word => word
      .substr(0, 1).toUpperCase()
      + word.substr(1).toLowerCase()
    )
    .join(' ')
}
