import { createSubscriptionManager } from './utils/subscription'

type Subscriber = () => void
type Unsubscribe = () => void

export interface Transaction {
  id: any
  commit: () => void
  rollback: () => void
  onCommitPhaseOne: (subscriber: Subscriber) => Unsubscribe
  onCommitPhaseTwo: (subscriber: Subscriber) => Unsubscribe
  onRollback: (subscriber: Subscriber) => Unsubscribe
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
    id: Math.random(),
    commit,
    rollback,
    onCommitPhaseOne,
    onCommitPhaseTwo,
    onRollback
  }
}
