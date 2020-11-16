import { atom } from './index'

export type User = {
  firstName: string
  lastName: string
}

export const USER: User = {
  firstName: 'austin',
  lastName: 'malerba'
}

export const USER_2: User = {
  firstName: 'frostin',
  lastName: 'malaria'
}

export const createUser$ = (user: User) => {
  return atom(user, {
    actions: (set) => ({
      setFirstName: (firstName: string) => {
        set((prev) => ({
          ...prev,
          firstName
        }))
      },
      set
    })
  })
}

export const createEffectSpy = () => {
  const effect = jest.fn()
  const cleanup = jest.fn()
  return {
    effect: (...args: any) => {
      effect(...args)
      return cleanup
    },
    spies: {
      effect,
      cleanup
    }
  }
}
