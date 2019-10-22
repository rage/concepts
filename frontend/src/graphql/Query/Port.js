import gql from 'graphql-tag'

const EXPORT_QUERY = gql`
query exportData($workspaceId: ID!) {
  exportData(workspaceId:$workspaceId)
}
`

export {
  EXPORT_QUERY
}
