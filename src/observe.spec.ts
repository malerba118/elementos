import { molecule, observe, derived } from './index'
import { createUser$, USER, USER_2, createEffectSpy } from './test-utils'

describe('observe', () => {
  let user$ = createUser$(USER)

  beforeEach(() => {
    user$ = createUser$(USER)
  })

  it('should run effect when intialized', () => {
    const { effect, spies } = createEffectSpy()
    observe(user$, effect)
    expect(spies.effect).toHaveBeenCalledTimes(1)
    expect(spies.effect).toBeCalledWith(USER)
    expect(spies.cleanup).toHaveBeenCalledTimes(0)
  })

  it('should run effect when value changed', () => {
    const { effect, spies } = createEffectSpy()
    observe(user$, effect)
    user$.actions.set(USER_2)
    expect(spies.effect).toHaveBeenNthCalledWith(1, USER)
    expect(spies.effect).toHaveBeenNthCalledWith(2, USER_2)
    expect(spies.cleanup).toHaveBeenCalledTimes(1)
  })

  it('should run effect when value changed', () => {
    const fullName$ = derived(
      user$,
      ({ firstName, lastName }) => firstName + ' ' + lastName
    )

    const { effect, spies } = createEffectSpy()
    observe(
      molecule({
        fullName: fullName$,
        user: user$
      }),
      effect
    )
    user$.actions.set(USER_2)
    expect(spies.effect).toHaveBeenCalledTimes(2)
    expect(spies.cleanup).toHaveBeenCalledTimes(1)
  })

  it('should not run after dispose', () => {
    const { effect, spies } = createEffectSpy()
    const dispose = observe(user$, effect)
    dispose()
    user$.actions.set(USER_2)
    user$.actions.setFirstName('frostin')
    expect(spies.effect).toHaveBeenCalledTimes(1)
    expect(spies.cleanup).toHaveBeenCalledTimes(1)
  })
})
