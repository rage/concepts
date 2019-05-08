import React from 'react'
import { useQuery } from 'react-apollo-hooks'
import { gql } from 'apollo-boost'

import Users from './components/Users'

const ALL_USERS = gql`
{
  allUsers {
    id
    username
  }
}
`

const App = (props) => {
  const allUsers = useQuery(ALL_USERS)

  return (
    <div className="App">
      <Users users={allUsers} />
    </div>
  )
}

export default App;
