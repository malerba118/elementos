import { atom } from 'elementos'

type Size = {
  width: number
  height: number
}

export const createWindowSize$ = () => {
  const size$ = atom<Size | null>(null)

  let listener: EventListener
  size$.onObserverChange(({ count }) => {
    // if there are no observers, remove listener
    if (count === 0 && listener) {
      window.removeEventListener('resize', listener)
    } else if (count > 0 && !listener) {
      // if there are observers, add listener
      listener = () => {
        size$.actions.set({
          height: window.innerHeight,
          width: window.innerWidth
        })
      }
      window.addEventListener('resize', listener)
    }
  })

  return size$
}
