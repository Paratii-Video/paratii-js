/**
 * eth.events implements a part of the API of the EventEmitter, that can be used to manage subscriptions to Ethereum events.
 * Available events:
 * - TransferPTI
 * - TransferETH
 * - CreateVideo
 * - UpdateVideo
 * - RemoveVideo
 * - BuyVideo
 * @param {Object} config configuration object to initialize Paratii object
 */
export class ParatiiEthEvents {
  constructor (config) {
    this.config = config
    this._subscriptions = {}
    this.subscribe = config.web3.eth.subscribe

    this._customEvents = {
      TransferPTI: {
        contract: 'ParatiiToken',
        event: 'Transfer'
      },
      TransferETH: {
        contract: 'SendEther',
        event: 'LogSendEther'
      },
      CreateVideo: {
        contract: 'Videos',
        event: 'LogCreateVideo'
      },
      UpdateVideo: {
        contract: 'Videos',
        event: 'LogCreateVideo'
      },
      RemoveVideo: {
        contract: 'Videos',
        event: 'LogRemoveVideo'
      },
      BuyVideo: {
        contract: 'Store',
        event: 'LogBuyVideo'
      },
      CreateUser: {
        contract: 'Users',
        event: 'LogCreateUser'
      },
      RemoveUser: {
        contract: 'Users',
        event: 'LogRemoveUser'
      },
      CreateVoucher: {
        contract: 'Vouchers',
        event: 'LogCreateVoucher'
      },
      RemoveVoucher: {
        contract: 'Vouchers',
        event: 'LogRemoveVoucher'
      },
      RedeemVoucher: {
        contract: 'Vouchers',
        event: 'LogRedeemVoucher'
      },
      Application: {
        contract: 'TcrPlaceholder',
        event: '_Application'
      },
      NewVideoWhitelisted: {
        contract: 'TcrPlaceholder',
        event: '_NewVideoWhitelisted'
      }
    }
  }
  /**
   * parse event from simple string to an object
   * @param  {string} eventType Event type
   * @return {Object}           Event Object
   * @example let structuredEvent = this._getStructuredEvent('some-event')
   * @private
   */
  _getStructuredEvent (eventType) {
    let structuredEvent = {}

    if (eventType.substr(eventType.length - 5).toLowerCase().indexOf('error') !== -1) {
      // error event
      structuredEvent.event = eventType.substr(0, eventType.length - 5)
      structuredEvent.emit = 'error'
    } else if (eventType.substr(eventType.length - 7).toLowerCase().indexOf('changed') !== -1) {
      // changed event
      structuredEvent.event = eventType.substr(0, eventType.length - 7)
      structuredEvent.emit = 'changed'
    } else {
      // data event
      structuredEvent.event = eventType
      structuredEvent.emit = 'data'
    }
    return structuredEvent
  }
  /**
   * subscribe to the specified event
   * @param  {string}  eventType type of the event
   * @param  {Function}  options   function called when the events occurs
   * @param  {?}  listener  optional ?
   * @return {Promise}           [description]
   */
  async addListener (eventType, options, listener) {
    if (this._isFunction(options)) {
      return this._addListener(eventType, options)
    } else {
      return this._addListener(eventType, listener, options)
    }
  }
  /**
   * [_addListener description]
   * TODO RIVEDI I TIPI
   * @param  {Object}  eventType [description]
   * @param  {Object}  listener  [description]
   * @param  {Object}  options   [description]
   * @return {Promise}           [description]
   * @private
   */
  async _addListener (eventType, listener, options) {
    let structuredEvent = this._getStructuredEvent(eventType)
    let subscription = null
    switch (structuredEvent.event) {
      case 'newBlockHeaders':
      case 'syncing':
      case 'pendingTransactions': {
        subscription = await this.subscribe(eventType)
        subscription.on(structuredEvent.emit, listener)
        break
      }
      case 'logs': {
        if (options === undefined) {
          options = {
            fromBlock: null,
            topics: null
          }
        }
        subscription = this.subscribe('logs', options)

        subscription.on(structuredEvent.emit, listener)
        break
      }
      default: {
        let contract = await this.config.getContract(this._customEvents[structuredEvent.event].contract)
        subscription = await contract.events[this._customEvents[structuredEvent.event].event](options)

        subscription.on(structuredEvent.emit, listener)
      }
    }

    return this.addSubscription(eventType, subscription)
  }
  /**
   * [_isFunction description]
   * TODO RIVEDI I TIPI
   * @param  {Object}  functionToCheck [description]
   * @return {Boolean}                 [description]
   * @private
   */
  _isFunction (functionToCheck) {
    var getType = {}
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]'
  }
  /**
   * [addSubscription description]
   * TODO RIVEDI I TIPI
   * @param {Object} eventType    [description]
   * @param {Object} subscription [description]
   * @private
   */
  addSubscription (eventType, subscription) {
    if (!this._subscriptions[eventType]) {
      this._subscriptions[eventType] = []
    }

    // const key = this._subscriptions[eventType].length
    subscription.eventType = eventType
    // subscription.id = key
    // console.log(subscription)
    this._subscriptions[eventType].push(subscription)

    return subscription
  }
  /**
   * [removeAllSubscriptions description]
   * TODO RIVEDI I TIPI
   * @param  {Object} eventType [description]
   * @return {Object}           [description]
   * @private
   */
  removeAllSubscriptions (eventType) {
    if (eventType === undefined) {
      this._subscriptions = {}
    } else {
      delete this._subscriptions[eventType]
    }
  }
  //
  // getSubscriptionsForType (eventType) {
  //   return this._subscriptions[eventType]
  // }
  //
  // removeSubscription (subscription) {
  //   const eventType = subscription.eventType
  //   const key = subscription.key
  //
  //   const subscriptionsForType = this._subscriptions[eventType]
  //   if (subscriptionsForType) {
  //     delete subscriptionsForType[key]
  //   }
  // }
}
