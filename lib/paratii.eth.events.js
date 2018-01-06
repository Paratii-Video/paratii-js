export class ParatiiEthEvents {
  constructor (context) {
    this._subscriptions = {}
    this.subscribe = context.web3.eth.subscribe
    this._topics = {
      Transfer: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef']
    }
  }

  addListener (eventType, options, listener) {
    let subscription = null

    switch (eventType) {
      case 'newBlockHeaders':
      case 'syncing':
      case 'pendingTransactions':
        subscription = this.subscribe(eventType, listener)
        break
      case 'logs':
        if (options === undefined) {
          options = {
            fromBlock: null,
            topics: null
          }
        }
        subscription = this.subscribe('logs', options, listener)
        break
      default:
        if (options === undefined) {
          options = {
            fromBlock: null,
            topics: this._topics[eventType]
          }
        }
        subscription = this.subscribe('logs', options, listener)
    }

    return this.addSubscription(eventType, subscription)
  }

  addSubscription (eventType, subscription) {
    if (!this._subscriptions[eventType]) {
      this._subscriptions[eventType] = []
    }

    const key = this._subscriptions[eventType].length

    this._subscriptions[eventType].push(subscription)
    subscription.eventType = eventType
    subscription.id = key
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
