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

String.prototype.toPascalCase = function() {
  return this
    .split(' ')
    .map(word => word
      .substr(0, 1).toUpperCase()
      + word.substr(1).toLowerCase()
    )
    .join('')
}

String.prototype.toCamelCase = function() {
  return this
    .split(' ')
    .map((word, index) => index === 0
      ? word.toLowerCase()
      : word.substr(0, 1).toUpperCase()
        + word.substr(1).toLowerCase()
    )
    .join('')
}

String.prototype.toUpperSnakeCase = function() {
  return this.toUpperCase().replace(' ', '_')
}
