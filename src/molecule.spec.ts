import { observe, molecule } from './index'
import { createUser$, USER, USER_2 } from './test-utils'

const createMol$ = () => {
  return molecule(
    {
      user1: createUser$(USER),
      user2: createUser$(USER_2)
    },
    {
      actions: (children) => children
    }
  )
}

describe('molecule', () => {
  let mol$ = createMol$()

  beforeEach(() => {
    mol$ = createMol$()
  })

  it('should get correct state when unobserved', () => {
    const USER_3 = {
      firstName: 'foo',
      lastName: 'bar'
    }
    expect(mol$.get()).toBe(mol$.get())
    mol$.actions.user1.actions.set(USER_3)
    expect(mol$.get().user1).toBe(USER_3)
  })

  it('should get correct state when observed', () => {
    const dispose = observe(mol$, () => {})
    const USER_3 = {
      firstName: 'foo',
      lastName: 'bar'
    }
    expect(mol$.get()).toBe(mol$.get())
    mol$.actions.user1.actions.set(USER_3)
    expect(mol$.get().user1).toBe(USER_3)
    dispose()
  })
})
