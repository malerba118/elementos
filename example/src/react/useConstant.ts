import { useRef } from 'react'

const useConstant = <T>(fn: () => T): T => {
  const ref = useRef<null | { value: T }>(null)
  if (ref.current == null) {
    // we instantiate { value } to not conflict with returned null
    ref.current = { value: fn() }
  }
  return ref.current.value
}

export default useConstant
