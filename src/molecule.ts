import {
  Observable,
  ObservableMap,
  ExtractObservableTypes,
  ExtractObservableType
} from './observable'
import { Transaction } from './transaction'
import { createSubscriptionManager } from './utils/subscription'

type Unsubscribe = () => void

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
  let value: DerivedState = deriver(getChildrenValues())
  const manager = createSubscriptionManager<[Transaction | undefined]>()
  const transactionValues = new WeakMap<Transaction, DerivedState>()

  const subscribeToChildren = () => {
    const unsubscribers: Unsubscribe[] = []
    Object.values(children).forEach((observable: any) => {
      const unsubscribe = observable.subscribe((transaction: Transaction) => {
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
          let nextValue: DerivedState = deriver(getChildrenValues(transaction))
          transactionValues.set(transaction, nextValue)
        }
        value = deriver(getChildrenValues(transaction))
        manager.notifySubscribers(transaction)
      })
      unsubscribers.push(unsubscribe)
    })

    const unsubscribeFromChildren = () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe())
    }
    return unsubscribeFromChildren
  }

  subscribeToChildren()

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

  return {
    ...observable,
    children,
    actions: actions?.(children) || ({} as Actions)
  }
}

export type Deriver<Deps extends ObservableMap, DerivedState> = (
  args: {
    [Index in keyof Deps]: ExtractObservableType<Deps[Index]>
  }
) => DerivedState
