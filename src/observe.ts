import { Transaction } from './transaction'
import { Observable } from './observable'

export type EffectCleanup = () => void
export type Effect<State> = (value: State) => EffectCleanup | void

export const observe = <State>(
  observable: Observable<State>,
  effect: Effect<State>
) => {
  const transactions = new Set<Transaction>()
  const tryRunEffect = () => {
    try {
      effect(observable.get())
    } catch (err) {
      console.warn('effect threw an error:', err)
    }
  }
  tryRunEffect()
  return observable.subscribe((transaction) => {
    if (transaction) {
      if (!transactions.has(transaction)) {
        transactions.add(transaction)
        transaction.onCommit(() => {
          tryRunEffect()
          transactions.delete(transaction)
        })
        transaction.onRollback(() => {
          transactions.delete(transaction)
        })
      }
    } else {
      tryRunEffect()
    }
  })
}
