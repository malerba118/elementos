import { atom } from './index'
import { getCurrentTransaction } from './context'
import { createUser$, USER, USER_2 } from './test-utils'

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
    } catch (err) {
      console.log(getCurrentTransaction())
    }
    expect(count$.get()).toEqual(10)
  })
})
