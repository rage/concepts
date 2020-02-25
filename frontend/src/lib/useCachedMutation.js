import { useCallback } from 'react'
import { useMutation } from '@apollo/react-hooks'

const useCachedMutation = (mutation, args, deps = []) => {
  const [fn] = useMutation(mutation, args)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(fn, deps)
}

export default useCachedMutation
