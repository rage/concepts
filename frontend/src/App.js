import React from 'react'
import { useQuery } from 'react-apollo-hooks'
import { gql } from 'apollo-boost'

import ConceptList from './components/ConceptList'
import ConceptForm from './components/ConceptForm'

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
      <ConceptList concepts={[
        {
          "name": "Hello",
          "id": "001"
        },
        {
          "name": "World",
          "id": "002"
        }
      ]}/>
      <ConceptForm/>
    </div>
  )
}

export default App;
