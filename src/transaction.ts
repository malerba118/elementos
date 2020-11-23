import { createSubscriptionManager } from './utils/subscription'

export type TransactionSubscriber = () => void
export type TransactionUnsubscriber = () => void

export interface Transaction {
  commit: () => void
  rollback: () => void
  onCommitPhaseOne: (
    subscriber: TransactionSubscriber
  ) => TransactionUnsubscriber
  onCommitPhaseTwo: (
    subscriber: TransactionSubscriber
  ) => TransactionUnsubscriber
  onRollback: (subscriber: TransactionSubscriber) => TransactionUnsubscriber
}

export const transaction = (): Transaction => {
  const managers = {
    commitPhaseOne: createSubscriptionManager(),
    commitPhaseTwo: createSubscriptionManager(),
    rollback: createSubscriptionManager()
  }

  const commit = () => {
    managers.commitPhaseOne.notifySubscribers()
    managers.commitPhaseTwo.notifySubscribers()
  }
  const rollback = () => {
    managers.rollback.notifySubscribers()
  }
  const onCommitPhaseOne = (subscriber: () => void) => {
    return managers.commitPhaseOne.subscribe(subscriber)
  }
  const onCommitPhaseTwo = (subscriber: () => void) => {
    return managers.commitPhaseTwo.subscribe(subscriber)
  }
  const onRollback = (subscriber: () => void) => {
    return managers.rollback.subscribe(subscriber)
  }
  return {
    commit,
    rollback,
    onCommitPhaseOne,
    onCommitPhaseTwo,
    onRollback
  }
}
