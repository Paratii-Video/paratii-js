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
      }
    };
  }

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
              return _context2.abrupt('break', 23);

            case 10:
              if (options === undefined) {
                options = {
                  fromBlock: null,
                  topics: null
                };
              }
              subscription = this.subscribe('logs', options);

              subscription.on(structuredEvent.emit, listener);
              return _context2.abrupt('break', 23);

            case 14:
              _context2.next = 16;
              return _regenerator2.default.awrap(this.config.getContract(this._customEvents[structuredEvent.event].contract));

            case 16:
              contract = _context2.sent;

              console.log(this.config.getContract(this._customEvents[structuredEvent.event].contract));
              console.log(contract);
              _context2.next = 21;
              return _regenerator2.default.awrap(contract.events[this._customEvents[structuredEvent.event].event](options));

            case 21:
              subscription = _context2.sent;


              subscription.on(structuredEvent.emit, listener);

            case 23:
              return _context2.abrupt('return', this.addSubscription(eventType, subscription));

            case 24:
            case 'end':
              return _context2.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: '_isFunction',
    value: function _isFunction(functionToCheck) {
      var getType = {};
      return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
    }
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