import React from 'react'
import { Redirect, Route } from 'react-router-dom'

const PrivateRoute = ({ render, redirectPath, condition, children, ...rest }) => (
  <Route
    {...rest}
    render={
      (props) => condition
        ? (render && render(props)) || children
        : <Redirect to={{
          pathname: redirectPath,
          state: { from: props.location }
        }} />
    }
  />
)

export default PrivateRoute
