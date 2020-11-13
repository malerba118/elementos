import { createSubscriptionManager } from './utils/subscription'

type Subscriber = () => void
type Unsubscribe = () => void

export interface Transaction {
  commit: () => void
  rollback: () => void
  onCommit: (subscriber: Subscriber) => Unsubscribe
  onRollback: (subscriber: Subscriber) => Unsubscribe
}

export const transaction = (): Transaction => {
  const managers = {
    commit: createSubscriptionManager(),
    rollback: createSubscriptionManager()
  }
  const commit = () => {
    managers.commit.notifySubscribers()
  }
  const rollback = () => {
    managers.rollback.notifySubscribers()
  }
  const onCommit = (subscriber: () => void) => {
    return managers.commit.subscribe(subscriber)
  }
  const onRollback = (subscriber: () => void) => {
    return managers.rollback.subscribe(subscriber)
  }
  return {
    commit,
    rollback,
    onCommit,
    onRollback
  }
}
