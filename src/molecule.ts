import {
  Observable,
  ObservableMap,
  ExtractObservableTypes,
  ExtractObservableType,
  ObserverChangeSubscriber,
  ObservableUnsubscriber
} from './observable'
import { Transaction } from './transaction'
import { getCurrentTransaction } from './context'
import { createSubscriptionManager, Unsubscriber } from './utils/subscription'
import { memoized, defaultParamsEqual } from './utils/memoize'

const paramsEqual = (params1: any[] | undefined, params2: any[]) => {
  return defaultParamsEqual(
    params1 && Object.values(params1[0]),
    Object.values(params2[0])
  )
}

export type MoleculeDeriver<Deps extends ObservableMap, DerivedState> = (
  args: {
    [Index in keyof Deps]: ExtractObservableType<Deps[Index]>
  }
) => DerivedState

export interface Molecule<
  Children extends ObservableMap,
  Actions extends {} = Children,
  DerivedState = ExtractObservableTypes<Children>
> extends Observable<DerivedState> {
  children: Children
  actions: Actions
}

export interface MoleculeOptions<
  Children extends ObservableMap,
  Actions extends {} = Children,
  DerivedState = ExtractObservableTypes<Children>
> {
  actions?: (children: Children) => Actions
  deriver?: MoleculeDeriver<Children, DerivedState>
}

export const molecule = <
  Children extends ObservableMap,
  Actions extends {} = Children,
  DerivedState = ExtractObservableTypes<Children>
>(
  children: Children,
  {
    actions,
    deriver = (x) => x as DerivedState
  }: MoleculeOptions<Children, Actions, DerivedState> = {}
): Molecule<Children, Actions, DerivedState> => {
  const getChildrenValues = (transaction?: Transaction): any => {
    let args: any = {}
    Object.keys(children).forEach((key) => {
      const observable: any = children[key]
      args[key] = observable.get((x: any) => x, transaction)
    })
    return args
  }
  const memoizedDeriver = memoized(deriver, { paramsEqual })
  const observerChangeManager = createSubscriptionManager<
    Parameters<ObserverChangeSubscriber>
  >()
  let unsubscribeFromChildren: Unsubscriber | undefined
  const manager = createSubscriptionManager<[Transaction]>({
    onSubscriberChange: ({ count }) => {
      observerChangeManager.notifySubscribers({ count })
      if (count > 0 && !unsubscribeFromChildren) {
        unsubscribeFromChildren = subscribeToChildren()
      } else if (count === 0 && unsubscribeFromChildren) {
        unsubscribeFromChildren()
        unsubscribeFromChildren = undefined
      }
    }
  })
  const transactionDerivers = new WeakMap<
    Transaction,
    MoleculeDeriver<Children, DerivedState>
  >()

  const subscribeToChildren = () => {
    const unsubscribers: ObservableUnsubscriber[] = []
    Object.values(children).forEach((observable: any) => {
      const unsubscribe = observable.subscribe((transaction: Transaction) => {
        if (!transactionDerivers.has(transaction)) {
          transaction.onCommitPhaseOne(() => {
            transactionDerivers.delete(transaction)
          })
          transaction.onRollback(() => {
            transactionDerivers.delete(transaction)
          })
          transactionDerivers.set(
            transaction,
            memoized(deriver, { paramsEqual })
          )
        }
        manager.notifySubscribers(transaction)
      })
      unsubscribers.push(unsubscribe)
    })

    const unsubscribeFromChildren = () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe())
    }
    return unsubscribeFromChildren
  }

  let observable: Observable<DerivedState> = {
    get: (
      selector = (x) => x as any,
      transaction = getCurrentTransaction()
    ) => {
      if (transaction && transactionDerivers.has(transaction)) {
        const transactionDeriver = transactionDerivers.get(transaction)
        return selector(
          transactionDeriver?.(getChildrenValues(transaction)) as DerivedState
        )
      }
      return selector(memoizedDeriver(getChildrenValues()))
    },
    subscribe: (subscriber: (transaction: Transaction) => void) => {
      return manager.subscribe(subscriber)
    },
    onObserverChange: (subscriber) => {
      return observerChangeManager.subscribe(subscriber)
    }
  }

  return {
    ...observable,
    children,
    actions: actions?.(children) || ((children as any) as Actions)
  }
}
