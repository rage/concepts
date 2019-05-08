import React, { useState } from 'react'
import { useMutation, useQuery } from 'react-apollo-hooks'
import { gql } from 'apollo-boost'

const CREATE_USER = gql`
mutation createUser($username: String!) {
  createUser(username: $username) {
    id
    username
  }
}
`

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
  const createUser = useMutation(CREATE_USER, {
    refetchQueries: [{ query: ALL_USERS }]
  })

  return (
    <div className="App">
      <Users users={allUsers} />
      <NewUser createUser={createUser} />
    </div>
  );
}

const Users = ({ users }) => {
  return (
    <div>
      {users.loading ?
        <div>loading...</div>
        :
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>ID</th>
            </tr>
          </thead>
          <tbody>
            {users.data.allUsers ?
              users.data.allUsers.map(u => {
                return (
                  <tr>
                    <td>
                      {u.username}
                    </td>
                    <td>
                      {u.id}
                    </td>
                  </tr>
                )
              })
              :
              null}
          </tbody>
        </table>
      }
    </div>
  )
}

const NewUser = (props) => {
  const [username, setUsername] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    await props.createUser({
      variables: { username }
    })
    setUsername('')
  }
  return (
    <div>
      <form onSubmit={submit}>
        <table>
          <tbody>
            <tr>
              <td>
                Username
              </td>
              <td>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </td>
            </tr>
          </tbody>
        </table>
        <button type="submit">Create user</button>
      </form>
    </div>
  )
}

export default App;
