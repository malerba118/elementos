import { observe, molecule, batched } from './index'
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

  it('should get/set transactional state during batched and rollback', () => {
    const effect = jest.fn()
    const dispose = observe(mol$, effect)
    const USER_3 = {
      firstName: 'foo',
      lastName: 'bar'
    }
    const spy1 = jest.fn()
    const spy2 = jest.fn()
    const spy3 = jest.fn()
    const spy4 = jest.fn()
    const run = batched(() => {
      mol$.actions.user1.actions.set(USER_3)
      mol$.actions.user1.actions.set((prev) => {
        spy1(prev)
        return prev
      })
      spy2(mol$.get().user1)
      spy3(mol$.actions.user1.get())
      spy4(mol$.actions.user2.get())
      throw new Error('rollback')
    })

    try {
      run()
    } catch (err) {}

    expect(spy1).toBeCalledWith(USER_3)
    expect(spy2).toBeCalledWith(USER_3)
    expect(spy3).toBeCalledWith(USER_3)
    expect(spy4).toBeCalledWith(USER_2)
    expect(mol$.get().user1).toBe(USER)
    expect(effect).toBeCalledTimes(1)
    dispose()
  })

  it('should get/set transactional state during batched and commit', () => {
    const effect = jest.fn()
    const dispose = observe(mol$, effect)
    const USER_3 = {
      firstName: 'foo',
      lastName: 'bar'
    }
    const spy1 = jest.fn()
    const spy2 = jest.fn()
    const run = batched(() => {
      mol$.actions.user1.actions.set(USER_3)
      mol$.actions.user1.actions.set((prev) => {
        spy1(prev)
        return prev
      })
      spy2(mol$.get().user1)
    })

    try {
      run()
    } catch (err) {}

    expect(spy1).toBeCalledWith(USER_3)
    expect(spy2).toBeCalledWith(USER_3)
    expect(mol$.get().user1).toBe(USER_3)
    expect(effect).toBeCalledTimes(2)
    dispose()
  })
})
