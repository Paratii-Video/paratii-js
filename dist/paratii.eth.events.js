"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiEthEvents = undefined;

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ParatiiEthEvents = exports.ParatiiEthEvents = function () {
  function ParatiiEthEvents(context) {
    (0, _classCallCheck3.default)(this, ParatiiEthEvents);

    this._subscriptions = {};
    this.subscribe = context.web3.eth.subscribe;
  }

  (0, _createClass3.default)(ParatiiEthEvents, [{
    key: "addListener",
    value: function addListener(eventType, listener) {
      return this.addSubscription(eventType, this.subscribe(eventType, listener));
    }
  }, {
    key: "addSubscription",
    value: function addSubscription(eventType, subscription) {
      if (!this._subscriptions[eventType]) {
        this._subscriptions[eventType] = [];
      }

      var key = this._subscriptions[eventType].length;

      this._subscriptions[eventType].push(subscription);
      subscription.eventType = eventType;
      subscription.key = key;
      return subscription;
    }
  }, {
    key: "removeAllSubscriptions",
    value: function removeAllSubscriptions(eventType) {
      if (eventType === undefined) {
        this._subscriptions = {};
      } else {
        delete this._subscriptions[eventType];
      }
    }
  }, {
    key: "getSubscriptionsForType",
    value: function getSubscriptionsForType(eventType) {
      return this._subscriptions[eventType];
    }
  }, {
    key: "removeSubscription",
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