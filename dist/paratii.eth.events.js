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
      LogCreateVideo: {
        contract: 'Videos',
        event: 'LogCreateVideo'
      },
      TransferETH: {
        contract: 'SendEther',
        event: 'Transfer'
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
      if (this._isFunction(options)) {
        this._addListener(eventType, options);
      } else {
        this._addListener(eventType, listener, options);
      }
    }
  }, {
    key: '_addListener',
    value: function _addListener(eventType, listener, options) {
      var structuredEvent, subscription, contract;
      return _regenerator2.default.async(function _addListener$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              structuredEvent = this._getStructuredEvent(eventType);
              subscription = null;
              _context.t0 = structuredEvent.event;
              _context.next = _context.t0 === 'newBlockHeaders' ? 5 : _context.t0 === 'syncing' ? 5 : _context.t0 === 'pendingTransactions' ? 5 : _context.t0 === 'logs' ? 10 : 14;
              break;

            case 5:
              _context.next = 7;
              return _regenerator2.default.awrap(this.subscribe(eventType));

            case 7:
              subscription = _context.sent;

              subscription.on(structuredEvent.emit, listener);
              return _context.abrupt('break', 21);

            case 10:
              if (options === undefined) {
                options = {
                  fromBlock: null,
                  topics: null
                };
              }
              subscription = this.subscribe('logs', options);
              subscription.on(structuredEvent.emit, listener);
              return _context.abrupt('break', 21);

            case 14:
              _context.next = 16;
              return _regenerator2.default.awrap(this.config.getContract(this._customEvents[structuredEvent.event].contract));

            case 16:
              contract = _context.sent;
              _context.next = 19;
              return _regenerator2.default.awrap(contract.events[this._customEvents[structuredEvent.event].event](options));

            case 19:
              subscription = _context.sent;

              subscription.on(structuredEvent.emit, listener);

            case 21:
              return _context.abrupt('return', this.addSubscription(eventType, subscription));

            case 22:
            case 'end':
              return _context.stop();
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

      var key = this._subscriptions[eventType].length;

      this._subscriptions[eventType].push(subscription);
      subscription.eventType = eventType;
      subscription.id = key;
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
  }, {
    key: 'getSubscriptionsForType',
    value: function getSubscriptionsForType(eventType) {
      return this._subscriptions[eventType];
    }
  }, {
    key: 'removeSubscription',
    value: function removeSubscription(subscription) {
      var eventType = subscription.eventType;
      var key = subscription.key;

      var subscriptionsForType = this._subscriptions[eventType];
      if (subscriptionsForType) {
        delete subscriptionsForType[key];
      }
    }
  }]);
  return ParatiiEthEvents;
}();