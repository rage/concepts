import React from 'react'
import { Redirect } from 'react-router-dom'

import { useLoginStateValue } from '../../store'
import UserViewContent from './UserViewContent'

const UserView = () => {
  const { loggedIn, user } = useLoginStateValue()[0]

  if (loggedIn) {
    switch (user.role) {
    case 'STUDENT':
    case 'STAFF':
    case 'GUEST':
      return <UserViewContent user={user} />
    case 'ADMIN':
      return <Redirect to='/admin' />
    default:
      return <Redirect to='/' />
    }
  } else {
    return <Redirect to='/' />
  }
}

export default UserView
