import {
  Observable,
  ObservableMap,
  ExtractObservableTypes,
  ExtractObservableType,
  ObserverChangeSubscriber
} from './observable'
import { Transaction } from './transaction'
import { getCurrentTransaction } from './context'
import { createSubscriptionManager } from './utils/subscription'
import { memoized, defaultParamsEqual } from './utils/memoize'

const paramsEqual = (params1: any[] | undefined, params2: any[]) => {
  return defaultParamsEqual(
    params1 && Object.values(params1[0]),
    Object.values(params2[0])
  )
}

type Unsubscribe = () => void

export type Deriver<Deps extends ObservableMap, DerivedState> = (
  args: {
    [Index in keyof Deps]: ExtractObservableType<Deps[Index]>
  }
) => DerivedState

export interface Molecule<
  Children extends ObservableMap,
  Actions extends {},
  DerivedState
> extends Observable<DerivedState> {
  children: Children
  actions: Actions
}

export interface MoleculeOptions<
  Children extends ObservableMap,
  Actions extends {},
  DerivedState
> {
  actions?: (children: Children) => Actions
  deriver?: Deriver<Children, DerivedState>
}

export const molecule = <
  Children extends ObservableMap,
  Actions extends {} = {},
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
  let unsubscribeFromChildren: Unsubscribe | undefined
  const manager = createSubscriptionManager<[Transaction | undefined]>({
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
    Deriver<Children, DerivedState>
  >()

  const subscribeToChildren = () => {
    // memoizedDeriver(getChildrenValues())
    const unsubscribers: Unsubscribe[] = []
    Object.values(children).forEach((observable: any) => {
      const unsubscribe = observable.subscribe((transaction: Transaction) => {
        if (transaction) {
          if (!transactionDerivers.has(transaction)) {
            transaction.onCommitPhaseOne(() => {
              // memoizedDeriver(getChildrenValues(transaction))
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
        }
        const transactionDeriver = transactionDerivers.get(transaction)
        transactionDeriver?.(getChildrenValues(transaction))
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
    subscribe: (subscriber: (transaction?: Transaction) => void) => {
      return manager.subscribe(subscriber)
    },
    onObserverChange: (subscriber) => {
      return observerChangeManager.subscribe(subscriber)
    }
  }

  return {
    ...observable,
    children,
    actions: actions?.(children) || ({} as Actions)
  }
}
