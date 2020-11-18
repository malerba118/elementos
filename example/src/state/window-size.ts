import { atom } from 'elementos'

type Size = {
  width: number
  height: number
}

export const createWindowSize$ = () => {
  const dimensions$ = atom<Size | null>(null)

  let listener: EventListener
  dimensions$.onObserverChange(({ count }) => {
    // if there are no observers, remove listener
    if (count === 0 && listener) {
      window.removeEventListener('resize', listener)
    } else if (count > 0 && !listener) {
      // if there are observers, add listener
      listener = () => {
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
