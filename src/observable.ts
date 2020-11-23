import { Transaction } from './transaction'

export type ObservableUnsubscriber = () => void
export type ObservableSubscriber = (transaction: Transaction) => void
export type ObserverChangeSubscriber = (params: { count: number }) => void

export interface Observable<State> {
  get: <Selection = State>(
    selector?: (val: State) => Selection,
    transaction?: Transaction
  ) => Selection
  subscribe: (subscriber: ObservableSubscriber) => ObservableUnsubscriber
  onObserverChange: (
    subscriber: ObserverChangeSubscriber
  ) => ObservableUnsubscriber
}

export type ExtractObservableType<Type> = Type extends Observable<infer X>
  ? X
  : never

export type ExtractObservableTypes<Map extends ObservableMap> = {
  [K in keyof Map]: ExtractObservableType<Map[K]>
}

export type ObservableMap = Record<string, Observable<any>>
