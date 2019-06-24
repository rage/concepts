import React from 'react'
import { Redirect } from 'react-router-dom'
import { useLoginStateValue } from '../../store'
import UserContent from './UserContent'

const UserView = () => {
  const { loggedIn, user } = useLoginStateValue()[0]

  if (loggedIn) {
    switch (user.role) {
      case 'STUDENT':
        return <UserContent userId={user.id} />
      case 'STAFF':
        return null
      case 'ADMIN':
        return <Redirect to={'/admin'} />
      default:
        return <Redirect to={'/'} />
    }
  } else {
    return <Redirect to={'/'} />
  }
}

export default UserView