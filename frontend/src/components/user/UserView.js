import React from 'react'
import { Redirect } from 'react-router-dom'

import { useLoginStateValue } from '../../store'
import UserContent from './UserContent'
import StaffContent from './StaffContent'

const UserView = () => {
  const { loggedIn, user } = useLoginStateValue()[0]

  if (loggedIn) {
    switch (user.role) {
    case 'STUDENT':
      return <UserContent />
    case 'STAFF':
      return <StaffContent />
    case 'ADMIN':
      return <Redirect to={'/admin'} />
    case 'GUEST':
      return <UserContent />
    default:
      return <Redirect to={'/'} />
    }
  } else {
    return <Redirect to={'/'} />
  }
}

export default UserView
