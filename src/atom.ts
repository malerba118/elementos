import { createSubscriptionManager } from './utils/subscription'
import { Transaction } from './transaction'
import { Observable } from './observable'

export type Setter<State> = (value: State) => State

export type Set<State> = (
  setter: State | Setter<State>,
  transaction?: Transaction
) => void

export interface DefaultActions<State> {
  set: Set<State>
}

export interface Atom<State, Actions extends {} = DefaultActions<State>>
  extends Observable<State> {
  actions: Actions
}

export interface AtomOptions<
  State,
  Actions extends {} = DefaultActions<State>
> {
  actions: (set: Set<State>) => Actions
}

let currentTransaction: Transaction | undefined

export const atom = <State, Actions extends {} = DefaultActions<State>>(
  defaultValue: State,
  options?: AtomOptions<State, Actions>
): Atom<State, Actions> => {
  let value: State = defaultValue
  const transactionValues = new WeakMap<Transaction, State>()
  const manager = createSubscriptionManager<[Transaction | undefined]>()
  const set = (
    setter: Setter<State> | State,
    transaction: Transaction | undefined = currentTransaction
  ) => {
    if (transaction) {
      if (!transactionValues.has(transaction)) {
        transaction.onCommit(() => {
          value = transactionValues.get(transaction) as State
          transactionValues.delete(transaction)
        })
        transaction.onRollback(() => {
          transactionValues.delete(transaction)
        })
        transactionValues.set(transaction, value)
      }
      let nextValue: State
      if (typeof setter === 'function') {
        nextValue = (setter as Setter<State>)(
          transactionValues.get(transaction) as State
        )
      } else {
        nextValue = setter
      }
      transactionValues.set(transaction, nextValue)
    } else {
      if (typeof setter === 'function') {
        value = (setter as Setter<State>)(value)
      } else {
        value = setter
      }
    }
    manager.notifySubscribers(transaction)
  }
  return {
    get: (selector = (x) => x as any, transaction) => {
      if (transaction && transactionValues.has(transaction)) {
        return selector(transactionValues.get(transaction) as State)
      }
      return selector(value)
    },
    subscribe: (subscriber: (transaction?: Transaction) => void) => {
      return manager.subscribe(subscriber)
    },
    actions: options?.actions?.(set) || (({ set } as any) as Actions)
  }
}
