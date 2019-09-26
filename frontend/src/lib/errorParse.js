const getImportErrorMessage = error => {
  switch (error.keyword) {
  case 'required':
    return error.message
  case 'additionalProperties':
    return `Unknown property '${error.params.additionalProperty}'`
  case 'type':
    return `${error.dataPath.replace('.', '')} ${error.message}`
  case 'oneOf':
    return 'must have either workspace or workspaceId'
  case 'minLength':
    return `${error.dataPath.replace('.', '')} must not be empty if set`
  default:
    return `Unknown error: ${error.message}`
  }
}

export { getImportErrorMessage }
