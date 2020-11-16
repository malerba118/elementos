import { atom } from './index'
import { getCurrentTransaction } from './context'
import { createUser$, USER, USER_2 } from './test-utils'
import { derived } from './derived'
import { observe } from './observe'

describe('atom', () => {
  let user$ = createUser$(USER)

  beforeEach(() => {
    user$ = createUser$(USER)
  })

  it('should get state with default selector', () => {
    expect(user$.get()).toBe(USER)
  })

  it('should get state with passed selector', () => {
    expect(user$.get((u) => u.firstName)).toEqual(USER.firstName)
  })

  it('should partially update state', () => {
    user$.actions.setFirstName('frostin')
    expect(user$.get((u) => u.firstName)).toEqual('frostin')
    expect(user$.get((u) => u.lastName)).toEqual('malerba')
    expect(user$.get()).not.toEqual(USER)
    expect(user$.get()).not.toBe(USER)
  })

  it('should fully update state', () => {
    user$.actions.set(USER_2)
    expect(user$.get((u) => u.firstName)).toEqual(USER_2.firstName)
    expect(user$.get((u) => u.lastName)).toEqual(USER_2.lastName)
    expect(user$.get()).not.toEqual(USER)
    expect(user$.get()).not.toBe(USER)
  })

  it('should work with no options', () => {
    const count$ = atom(10)
    expect(count$.get()).toEqual(10)
    count$.actions.set(11)
    expect(count$.get()).toEqual(11)
    count$.actions.set((p) => p + 1)
    expect(count$.get()).toEqual(12)
  })

  it('should commit at the end of setting', () => {
    const count$ = atom(10)
    expect(count$.get()).toEqual(10)
    count$.actions.set(() => {
      count$.actions.set(11)
      const snapshot = count$.get()
      count$.actions.set(12)
      return snapshot
    })
    expect(count$.get()).toEqual(11)
  })

  it('should rollback if error thrown', () => {
    const count$ = atom(10)
    expect(count$.get()).toEqual(10)
    try {
      count$.actions.set(() => {
        count$.actions.set(11)
        throw new Error('foo')
      })
    } catch (err) {}
    expect(count$.get()).toEqual(10)
  })

  it('should lazy subscribe with calls to onObserverChange', () => {
    const count$ = atom(10)
    const doubled$ = derived(count$, (count) => count * 2)
    const observerChangeListeners = {
      count: jest.fn(),
      doubled: jest.fn()
    }
    count$.onObserverChange(observerChangeListeners.count)
    doubled$.onObserverChange(observerChangeListeners.doubled)
    expect(observerChangeListeners.count).toHaveBeenCalledTimes(0)
    expect(observerChangeListeners.doubled).toHaveBeenCalledTimes(0)
    const dispose = observe(doubled$, () => {})
    expect(observerChangeListeners.count).toHaveBeenCalledTimes(1)
    expect(observerChangeListeners.doubled).toHaveBeenCalledTimes(1)
    expect(observerChangeListeners.count).toHaveBeenNthCalledWith(1, {
      count: 1
    })
    expect(observerChangeListeners.doubled).toHaveBeenNthCalledWith(1, {
      count: 1
    })
    dispose()
    expect(observerChangeListeners.count).toHaveBeenNthCalledWith(2, {
      count: 0
    })
    expect(observerChangeListeners.doubled).toHaveBeenNthCalledWith(2, {
      count: 0
    })
  })
})
