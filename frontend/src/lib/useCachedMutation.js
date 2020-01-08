import { useCallback } from 'react'
import { useMutation } from 'react-apollo-hooks'

const useCachedMutation = (mutation, args, deps = []) =>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useCallback(useMutation(mutation, args), deps)

export default useCachedMutation
