import { atom } from 'elementos'

type Size = {
  width: number
  height: number
}

export const createWindowSize$ = () => {
  const dimensions$ = atom<Size | null>(null)

  let listener: EventListener
  dimensions$.onObserverChange(({ count }) => {
    if (count === 0 && listener) {
      window.removeEventListener('resize', listener)
    } else if (count > 0 && !listener) {
      listener = (): any => {
        dimensions$.actions.set({
          height: window.innerHeight,
          width: window.innerWidth
        })
      }
      window.addEventListener('resize', listener)
    }
  })

  return dimensions$
}
