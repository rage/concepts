import React from 'react'

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

export default Users