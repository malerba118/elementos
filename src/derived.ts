import { Observable, ExtractObservableType } from './observable'
import { Transaction } from './transaction'
import { createSubscriptionManager } from './utils/subscription'

export const derived = <
  Child extends Observable<any>,
  DerivedState = ExtractObservableType<Child>
>(
  child: Child,
  deriver: (state: ExtractObservableType<Child>) => DerivedState
): Observable<DerivedState> => {
  const getChildValue = (transaction?: Transaction) => {
    return child.get((x) => x, transaction)
  }
  let value: DerivedState = deriver(getChildValue())
  const manager = createSubscriptionManager<[Transaction | undefined]>()
  const transactionValues = new WeakMap<Transaction, DerivedState>()

  const subscribeToChild = () => {
    const unsubscribe = child.subscribe((transaction?: Transaction) => {
      if (transaction) {
        if (!transactionValues.has(transaction)) {
          transaction.onCommit(() => {
            value = transactionValues.get(transaction) as DerivedState
            transactionValues.delete(transaction)
          })
          transaction.onRollback(() => {
            transactionValues.delete(transaction)
          })
          transactionValues.set(transaction, value)
        }
        let nextValue: DerivedState = deriver(getChildValue(transaction))
        transactionValues.set(transaction, nextValue)
      }
      value = deriver(getChildValue(transaction))
      manager.notifySubscribers(transaction)
    })

    return unsubscribe
  }

  subscribeToChild()

  let observable: Observable<DerivedState> = {
    get: (selector = (x) => x as any, transaction) => {
      if (transaction && transactionValues.has(transaction)) {
        return selector(transactionValues.get(transaction) as DerivedState)
      }
      return selector(value)
    },
    subscribe: (subscriber: (transaction?: Transaction) => void) => {
      return manager.subscribe(subscriber)
    }
  }

  return observable
}
