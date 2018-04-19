/**
 * eth.events implements a part of the API of the EventEmitter, that can be used to manage subscriptions to Ethereum events.
 * Available events: <br>
 * - TransferPTI, triggered when PTI are transfered through the ParatiiToken contract <br>
 * - TransferETH, triggered when ETH are transfered through the SendEther contract <br>
 * - CreateVideo, triggered when a video is created through the Videos contract <br>
 * - UpdateVideo, triggered when a video is updated through the Videos contract <br>
 * - RemoveVideo, triggered when a video is removed through the Videos contract <br>
 * - BuyVideo, triggered when a video is bought through the Store contract <br>
 * - CreateUser, triggered when a user is created through the Users contract <br>
 * - CreateVoucher, triggered when a voucher is created through the Vouchers contract <br>
 * - RemoveUser, triggered when a user is removed through the Users contract <br>
 * - ReedemVoucher, triggered when a voucher is reedemed through the Vouchers contract <br>
 * - RemoveVoucher, triggered when a voucher is removed through the Vouchers contract <br>
 * - Application, triggered when a video applies through the TcrPlaceholder contract <br>
 * @param {Object} config configuration object to initialize Paratii object
 * - NewVideoWhitelisted, triggered when a video is whitelisted through the TcrPlaceholder contract
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
   * @example let structuredEvent = this._getStructuredEvent('RemoveVoucher')
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
   * subscribe to the specified event. Can be called with or without options
   * @param  {string}  eventType string representing the event
   * @param  {Object}  options   optional data
   * @param  {Function}  listener  function that is triggered when the events occurs
   * @return {Promise}           EventEmitter of that subscription
   * @example await paratii.eth.events.addListener('CreateVideo', options, function (log) {
   *    helper.logEvents(log, '📼  CreateVideo Event at Videos contract events')
   *    creatingVideoQueue.push(log)
   *    if (log.returnValues.ipfsData && log.returnValues.ipfsData !== '') {
   *      gettingVideoMetaQueue.push(log)
   *    }
   *  })
   */
  async addListener (eventType, options, listener) {
    if (this._isFunction(options)) {
      return this._addListener(eventType, options)
    } else {
      return this._addListener(eventType, listener, options)
    }
  }
  /**
   * subscribe to the specified event.
   * @param  {string}  eventType string representing the event
   * @param  {function}  listener  function that is triggered when the events occurs
   * @param  {Object}  options   optional data
   * @return {Promise}           EventEmitter of that subscription
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
   * Helper function
   * @param  {Object}  functionToCheck
   * @return {Boolean}                 trye if functionToCheck is a function, false otherwise
   * @private
   */
  _isFunction (functionToCheck) {
    var getType = {}
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]'
  }
  /**
   * adds subscription to the array of all the subscriptions
   * @param {Object} eventType    event
   * @param {Object} subscription event emitter related to that event
   * @return EventEmitter of that subscription
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
   * Should remove all subscriptions
   * @todo it doens't work
   * @param  {Object} eventType event
   * @return {Object}           ?
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
