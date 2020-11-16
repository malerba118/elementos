import {
  Observable,
  ExtractObservableType,
  ObserverChangeSubscriber
} from './observable'
import { getCurrentTransaction } from './context'
import { Transaction } from './transaction'
import { createSubscriptionManager, Unsubscribe } from './utils/subscription'

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
  const observerChangeManager = createSubscriptionManager<
    Parameters<ObserverChangeSubscriber>
  >()
  let unsubscribeFromChild: Unsubscribe | undefined
  const manager = createSubscriptionManager<[Transaction | undefined]>({
    onSubscriberChange: ({ count }) => {
      observerChangeManager.notifySubscribers({ count })
      if (count > 0 && !unsubscribeFromChild) {
        unsubscribeFromChild = subscribeToChild()
      } else if (count === 0 && unsubscribeFromChild) {
        unsubscribeFromChild()
        unsubscribeFromChild = undefined
      }
    }
  })
  const transactionValues = new WeakMap<Transaction, DerivedState>()

  const subscribeToChild = () => {
    value = deriver(getChildValue())
    const unsubscribe = child.subscribe((transaction?: Transaction) => {
      if (transaction) {
        if (!transactionValues.has(transaction)) {
          transaction.onCommitPhaseOne(() => {
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

  let observable: Observable<DerivedState> = {
    get: (
      selector = (x) => x as any,
      transaction = getCurrentTransaction()
    ) => {
      if (transaction && transactionValues.has(transaction)) {
        return selector(transactionValues.get(transaction) as DerivedState)
      }
      return selector(value)
    },
    subscribe: (subscriber: (transaction?: Transaction) => void) => {
      return manager.subscribe(subscriber)
    },
    onObserverChange: (subscriber) => {
      return observerChangeManager.subscribe(subscriber)
    }
  }

  return observable
}
