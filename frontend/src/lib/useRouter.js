import { useContext } from 'react'
// TODO hopefully react-router ships with hooks before breaking this import
import { __RouterContext as RouterContext } from 'react-router-dom'

export default () => useContext(RouterContext)
