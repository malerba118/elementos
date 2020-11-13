import { Transaction } from './transaction'

export type Unsubscribe = () => void
export type Subscriber = (transaction?: Transaction) => void

export interface Observable<State> {
  get: <Selection = State>(
    selector?: (val: State) => Selection,
    transaction?: Transaction
  ) => Selection
  subscribe: (subscriber: Subscriber) => Unsubscribe
}

export type ExtractObservableType<Type> = Type extends Observable<infer X>
  ? X
  : never

export type ExtractObservableTypes<Map extends ObservableMap> = {
  [K in keyof Map]: ExtractObservableType<Map[K]>
}

export type ObservableMap = Record<string, Observable<any>>
