import React from 'react'
import { Redirect, Route } from 'react-router-dom'

const PrivateRoute = ({ render, redirectPath, redirectPathFunc, condition, children, ...rest }) => {
  return (
    <Route {...rest} render={(props) =>
      condition
        ? (render && render(props)) || children
        : (
          <Redirect
            to={{
              pathname: redirectPathFunc ? redirectPathFunc(props.match.params) : redirectPath,
              state: { from: props.location }
            }}
          />
        )
    }
    />)
}

export default PrivateRoute
