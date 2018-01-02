'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ParatiiEthUsers = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ParatiiEthUsers = exports.ParatiiEthUsers = function () {
    function ParatiiEthUsers(context) {
        (0, _classCallCheck3.default)(this, ParatiiEthUsers);

        this._subscriptions = {};
        this.eth = context;
    }

    (0, _createClass3.default)(ParatiiEthUsers, [{
        key: 'addSubscription',
        value: function addSubscription(eventType) {
            if (!this._subscriptionsForType[eventType]) {
                this._subscriptionsForType[eventType] = [];
            }
            var key = this._subscriptionsForType[eventType].length;
            var subscription = {};
            this._subscriptionsForType[eventType].push(' registered ');
            subscription.eventType = eventType;
            subscription.key = key;
            return subscription;
        }
    }, {
        key: 'removeAllSubscriptions',
        value: function removeAllSubscriptions(eventType) {
            if (eventType === undefined) {
                this._subscriptionsForType = {};
            } else {
                delete this._subscriptionsForType[eventType];
            }
        }
    }, {
        key: 'getSubscriptionsForType',
        value: function getSubscriptionsForType(eventType) {
            return this._subscriptionsForType[eventType];
        }
    }]);
    return ParatiiEthUsers;
}();