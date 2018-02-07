'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiCoreUsers = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var dopts = require('default-options');

/**
 * ParatiiCoreUsers
 *
 */

var ParatiiCoreUsers = exports.ParatiiCoreUsers = function () {
  function ParatiiCoreUsers(config) {
    (0, _classCallCheck3.default)(this, ParatiiCoreUsers);

    var defaults = {
      'db.provider': null
    };
    var options = dopts(config, defaults, { allowUnknown: true });
    this.config = options;
  }

  (0, _createClass3.default)(ParatiiCoreUsers, [{
    key: 'create',
    value: function create(options) {
      return this.paratii.eth.users.create(options);
    }
  }, {
    key: 'get',
    value: function get(id) {
      return this.paratii.eth.users.get(id);
    }
  }, {
    key: 'update',
    value: function update(id, options) {
      return this.paratii.eth.users.update(id, options);
    }
  }]);
  return ParatiiCoreUsers;
}();