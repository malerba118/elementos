interface CreateSubscriptionManagerOptions {
  onSubscriberChange?: (params: { count: number }) => void
  reverse?: boolean
}

export type Unsubscribe = () => void

export const createSubscriptionManager = <SubscriberArgs extends any[] = []>({
  onSubscriberChange,
  reverse = false
}: CreateSubscriptionManagerOptions = {}) => {
  type Subscriber = (...args: SubscriberArgs) => void
  let subscribers: Subscriber[] = []
  return {
    subscribe: (subscriber: Subscriber): Unsubscribe => {
      subscribers = reverse
        ? [subscriber, ...subscribers]
        : [...subscribers, subscriber]
      onSubscriberChange && onSubscriberChange({ count: subscribers.length })
      return () => {
        subscribers = subscribers.filter((s) => s !== subscriber)
        onSubscriberChange && onSubscriberChange({ count: subscribers.length })
      }
    },
    notifySubscribers: (...args: SubscriberArgs) => {
      subscribers.forEach((subscriber) => {
        subscriber(...args)
      })
    }
  }
}
