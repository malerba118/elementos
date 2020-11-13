interface CreateSubscriptionManagerOptions {
  onSubscriberChange?: (count: number) => void
}

export const createSubscriptionManager = <SubscriberArgs extends any[] = []>({
  onSubscriberChange
}: CreateSubscriptionManagerOptions = {}) => {
  type Subscriber = (...args: SubscriberArgs) => void
  type Unsubscribe = () => void
  let subscribers: Subscriber[] = []
  return {
    subscribe: (subscriber: Subscriber): Unsubscribe => {
      subscribers.push(subscriber)
      onSubscriberChange?.(subscribers.length)
      return () => {
        subscribers = subscribers.filter((s) => s !== subscriber)
        onSubscriberChange?.(subscribers.length)
      }
    },
    notifySubscribers: (...args: SubscriberArgs) => {
      subscribers.forEach((subscriber) => {
        subscriber(...args)
      })
    }
  }
}
