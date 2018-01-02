export class ParatiiEthEvents {
  constructor (context) {
    this._subscriptions = {}
    this.subscribe = context.web3.eth.subscribe
  }

  addListener (eventType, listener) {
    return this.addSubscription(eventType, this.subscribe(eventType, listener))
  }

  addSubscription (eventType, subscription) {
    if (!this._subscriptions[eventType]) {
      this._subscriptions[eventType] = []
    }

    const key = this._subscriptions[eventType].length

    this._subscriptions[eventType].push(subscription)
    subscription.eventType = eventType
    subscription.key = key
    return subscription
  }

  removeAllSubscriptions (eventType) {
    if (eventType === undefined) {
      this._subscriptions = {}
    } else {
      delete this._subscriptions[eventType]
    }
  }

  getSubscriptionsForType (eventType) {
    return this._subscriptions[eventType]
  }

  removeSubscription (subscription) {
    const eventType = subscription.eventType
    const key = subscription.key

    const subscriptionsForType = this._subscriptions[eventType]
    if (subscriptionsForType) {
      delete subscriptionsForType[key]
    }
  }
}
