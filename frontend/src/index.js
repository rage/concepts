import React from 'react'
import ReactDOM from 'react-dom'
import * as Sentry from '@sentry/browser'

import './lib/titleCase'
import ConceptsWrapper from './Wrapper'

// eslint-disable-next-line no-undef
if (process.env.NODE_ENV === 'production') {
  Sentry.init({ dsn: 'https://7f1caeb36aff4af79d556609a311b69a@sentry.io/1796166' })
} else {
  console.log('Dev build; not enabling Sentry')
}
ReactDOM.render(<ConceptsWrapper />, document.getElementById('root'))
