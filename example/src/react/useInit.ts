import { useState, useEffect, useRef } from 'react'
import { Atom, atom, batched } from 'elementos'
import usePrevious from './usePrevious'

type UnmountSubscriber = () => void
type Intializer<T, Atoms> = (params: {
  beforeUnmount: (subscriber: UnmountSubscriber) => void
  atoms: Atoms
}) => T

const mapValues = <Obj extends {}>(obj: Obj, mapper: (val: any) => any) => {
  var k, result, v
  result = {}
  for (k in obj) {
    v = obj[k]
    result[k] = mapper(v)
  }
  return result as { [K in keyof Obj]: any }
}

type Atoms<Observed> = { [K in keyof Observed]: Atom<Observed[K]> }

export const useInit = <T, Observed extends {} = {}>(
  initializer: Intializer<T, Atoms<Observed>>,
  observed: Observed = {} as Observed
): T => {
  const unmountSubscribersRef = useRef<UnmountSubscriber[]>([])
  const [atoms] = useState<Atoms<Observed>>(() => {
    return mapValues(observed, (val) => atom(val))
  })

  const [state] = useState(() => {
    const beforeUnmount = (subscriber: UnmountSubscriber) => {
      unmountSubscribersRef.current.push(subscriber)
    }
    return initializer({ beforeUnmount, atoms })
  })

  const prevObserved = usePrevious(observed)

  useEffect(() => {
    if (!prevObserved) {
      return
    }
    // update atoms if pbserved values have changed
    batched(() => {
      Object.keys(atoms).forEach((key) => {
        if (!Object.is(prevObserved[key], observed[key])) {
          console.log(atoms[key].actions)
          atoms[key].actions.set(observed[key])
        }
      })
    })()
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
