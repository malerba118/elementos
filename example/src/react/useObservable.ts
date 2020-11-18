import { useState, useEffect } from 'react'
import { Observable, observe } from 'elementos'

export const useObservable = <T>(observable: Observable<T>): T => {
  const [state, setState] = useState<T>(observable.get())

  useEffect(() => {
    return observe(observable, (value) => {
      setState(value)
    })
  }, [])

  return state
}
