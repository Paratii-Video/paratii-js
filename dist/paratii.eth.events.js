'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiEthEvents = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
 * - Application, triggered when a video applies through the TcrRegistry contract <br>
 * @param {Object} config configuration object to initialize Paratii object
 * - NewVideoWhitelisted, triggered when a video is whitelisted through the TcrRegistry contract
 */
var ParatiiEthEvents = exports.ParatiiEthEvents = function () {
  function ParatiiEthEvents(config) {
    (0, _classCallCheck3.default)(this, ParatiiEthEvents);

    this.config = config;
    this._subscriptions = {};
    this.subscribe = config.web3.eth.subscribe;

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
        contract: 'TcrRegistry',
        event: '_Application'
      },
      NewVideoWhitelisted: {
        contract: 'TcrRegistry',
        event: '_NewVideoWhitelisted'
      }
    };
  }
  /**
   * parse event from simple string to an object
   * @param  {string} eventType Event type
   * @return {Object}           Event Object
   * @example let structuredEvent = this._getStructuredEvent('RemoveVoucher')
   * @private
   */


  (0, _createClass3.default)(ParatiiEthEvents, [{
    key: '_getStructuredEvent',
    value: function _getStructuredEvent(eventType) {
      var structuredEvent = {};

      if (eventType.substr(eventType.length - 5).toLowerCase().indexOf('error') !== -1) {
        // error event
        structuredEvent.event = eventType.substr(0, eventType.length - 5);
        structuredEvent.emit = 'error';
      } else if (eventType.substr(eventType.length - 7).toLowerCase().indexOf('changed') !== -1) {
        // changed event
        structuredEvent.event = eventType.substr(0, eventType.length - 7);
        structuredEvent.emit = 'changed';
      } else {
        // data event
        structuredEvent.event = eventType;
        structuredEvent.emit = 'data';
      }
      return structuredEvent;
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

  }, {
    key: 'addListener',
    value: function addListener(eventType, options, listener) {
      return _regenerator2.default.async(function addListener$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (!this._isFunction(options)) {
                _context.next = 4;
                break;
              }

              return _context.abrupt('return', this._addListener(eventType, options));

            case 4:
              return _context.abrupt('return', this._addListener(eventType, listener, options));

            case 5:
            case 'end':
              return _context.stop();
          }
        }
      }, null, this);
    }
    /**
     * subscribe to the specified event.
     * @param  {string}  eventType string representing the event
     * @param  {function}  listener  function that is triggered when the events occurs
     * @param  {Object}  options   optional data
     * @return {Promise}           EventEmitter of that subscription
     * @private
     */

  }, {
    key: '_addListener',
    value: function _addListener(eventType, listener, options) {
      var structuredEvent, subscription, contract;
      return _regenerator2.default.async(function _addListener$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              structuredEvent = this._getStructuredEvent(eventType);
              subscription = null;
              _context2.t0 = structuredEvent.event;
              _context2.next = _context2.t0 === 'newBlockHeaders' ? 5 : _context2.t0 === 'syncing' ? 5 : _context2.t0 === 'pendingTransactions' ? 5 : _context2.t0 === 'logs' ? 10 : 14;
              break;

            case 5:
              _context2.next = 7;
              return _regenerator2.default.awrap(this.subscribe(eventType));

            case 7:
              subscription = _context2.sent;

              subscription.on(structuredEvent.emit, listener);
              return _context2.abrupt('break', 21);

            case 10:
              if (options === undefined) {
                options = {
                  fromBlock: null,
                  topics: null
                };
              }
              subscription = this.subscribe('logs', options);

              subscription.on(structuredEvent.emit, listener);
              return _context2.abrupt('break', 21);

            case 14:
              _context2.next = 16;
              return _regenerator2.default.awrap(this.config.getContract(this._customEvents[structuredEvent.event].contract));

            case 16:
              contract = _context2.sent;
              _context2.next = 19;
              return _regenerator2.default.awrap(contract.events[this._customEvents[structuredEvent.event].event](options));

            case 19:
              subscription = _context2.sent;

              subscription.on(structuredEvent.emit, listener);

            case 21:
              return _context2.abrupt('return', this.addSubscription(eventType, subscription));

            case 22:
            case 'end':
              return _context2.stop();
          }
        }
      }, null, this);
    }
    /**
     * Helper function
     * @param  {Object}  functionToCheck
     * @return {Boolean}                 trye if functionToCheck is a function, false otherwise
     * @private
     */

  }, {
    key: '_isFunction',
    value: function _isFunction(functionToCheck) {
      var getType = {};
      return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
    }
    /**
     * adds subscription to the array of all the subscriptions
     * @param {Object} eventType    event
     * @param {Object} subscription event emitter related to that event
     * @return EventEmitter of that subscription
     * @private
     */

  }, {
    key: 'addSubscription',
    value: function addSubscription(eventType, subscription) {
      if (!this._subscriptions[eventType]) {
        this._subscriptions[eventType] = [];
      }

      // const key = this._subscriptions[eventType].length
      subscription.eventType = eventType;
      // subscription.id = key
      // console.log(subscription)
      this._subscriptions[eventType].push(subscription);

      return subscription;
    }
    /**
     * Should remove all subscriptions
     * @todo it doens't work
     * @param  {Object} eventType event
     * @return {Object}           ?
     * @private
     */

  }, {
    key: 'removeAllSubscriptions',
    value: function removeAllSubscriptions(eventType) {
      if (eventType === undefined) {
        this._subscriptions = {};
      } else {
        delete this._subscriptions[eventType];
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

  }]);
  return ParatiiEthEvents;
}();