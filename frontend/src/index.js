import React from 'react'
import ReactDOM from 'react-dom'
import * as Sentry from '@sentry/browser'

import ConceptsWrapper from './Wrapper'

Sentry.init({ dsn: 'https://7f1caeb36aff4af79d556609a311b69a@sentry.io/1796166' })
ReactDOM.render(<ConceptsWrapper />, document.getElementById('root'))
