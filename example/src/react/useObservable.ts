import { useState, useEffect } from 'react'
import { Observable, observe, ExtractObservableType } from 'elementos'

export const useObservable = <T extends Observable<any>>(
  observable: T
): ExtractObservableType<T> => {
  const [state, setState] = useState<ExtractObservableType<T>>(observable.get())

  useEffect(() => {
    return observe(observable, (value) => {
      setState(value)
    })
  }, [observable])

  return state
}
