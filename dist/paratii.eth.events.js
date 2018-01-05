'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiEthEvents = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ParatiiEthEvents = exports.ParatiiEthEvents = function () {
  function ParatiiEthEvents(context) {
    (0, _classCallCheck3.default)(this, ParatiiEthEvents);

    this._subscriptions = {};
    this.subscribe = context.web3.eth.subscribe;
    this._topics = {
      transfer: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef']
    };
  }

  (0, _createClass3.default)(ParatiiEthEvents, [{
    key: 'addListener',
    value: function addListener(eventType, options, listener) {
      var subscription = null;

      switch (eventType) {
        case 'newBlockHeaders':
        case 'syncing':
        case 'pendingTransactions':
          subscription = this.subscribe(eventType, listener);
          break;
        case 'logs':
          if (options === undefined) {
            options = {
              fromBlock: null,
              topics: null
            };
          }
          subscription = this.subscribe('logs', options, listener);
          break;
        default:
          if (options === undefined) {
            options = {
              fromBlock: null,
              topics: this._topics[eventType]
            };
          }
          subscription = this.subscribe('logs', options, listener);
      }

      return this.addSubscription(eventType, subscription);
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