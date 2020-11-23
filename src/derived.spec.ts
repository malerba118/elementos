import { observe, derived } from './index'
import { createUser$, USER } from './test-utils'

const createFullName$ = () => {
  return derived(
    createUser$(USER),
    (user) => `${user.firstName} ${user.lastName}`
  )
}

describe('derived', () => {
  let fullName$ = createFullName$()

  beforeEach(() => {
    fullName$ = createFullName$()
  })

  it('should get correct state when unobserved', () => {
    expect(fullName$.get()).toBe('austin malerba')
  })

  it('should update when child updates', () => {
    fullName$.child.actions.setFirstName('foo')
    expect(fullName$.get()).toBe('foo malerba')
  })

  it('should notify observer when child updated', () => {
    const effect = jest.fn()
    const dispose = observe(fullName$, effect)
    fullName$.child.actions.setFirstName('foo')
    fullName$.child.actions.setFirstName('foo')
    expect(effect).toBeCalledTimes(2)
    expect(effect).toHaveBeenNthCalledWith(1, 'austin malerba')
    expect(effect).toHaveBeenNthCalledWith(2, 'foo malerba')
    dispose()
  })

  it('should receive updates through onObserverChange', () => {
    const listener = jest.fn()
    fullName$.onObserverChange(listener)
    expect(listener).toHaveBeenCalledTimes(0)
    const dispose1 = observe(fullName$, () => {})
    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenNthCalledWith(1, { count: 1 })
    const dispose2 = observe(fullName$, () => {})
    expect(listener).toHaveBeenCalledTimes(2)
    expect(listener).toHaveBeenNthCalledWith(2, { count: 2 })
    dispose1()
    expect(listener).toHaveBeenCalledTimes(3)
    expect(listener).toHaveBeenNthCalledWith(3, { count: 1 })
    dispose2()
    expect(listener).toHaveBeenCalledTimes(4)
    expect(listener).toHaveBeenNthCalledWith(4, { count: 0 })
  })

  it('effect should not run if not changed', () => {
    const lastName$ = derived(createUser$(USER), (user) => user.lastName)
    const effect = jest.fn()
    observe(lastName$, effect)
    expect(effect).toHaveBeenCalledTimes(1)
    lastName$.child.actions.setFirstName('foo')
    expect(effect).toHaveBeenCalledTimes(1)
  })
})
