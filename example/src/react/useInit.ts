import { useState, useEffect, useRef } from 'react'

type UnmountSubscriber = () => void
type Intializer<T> = (params: {
  beforeUnmount: (subscriber: UnmountSubscriber) => void
}) => T

export const useInit = <T>(initializer: Intializer<T>): T => {
  const unmountSubscribersRef = useRef<UnmountSubscriber[]>([])
  const [state] = useState(() => {
    const beforeUnmount = (subscriber: UnmountSubscriber) => {
      unmountSubscribersRef.current.push(subscriber)
    }
    return initializer({ beforeUnmount })
  })

  useEffect(() => {
    return () => {
      unmountSubscribersRef.current.forEach((subscriber) => {
        subscriber()
      })
    }
  }, [])

  return state
}
