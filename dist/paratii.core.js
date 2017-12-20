'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiCore = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _paratiiCoreVids = require('./paratii.core.vids.js');

var _paratiiCoreUsers = require('./paratii.core.users.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var dopts = require('default-options');

/**
 * ParatiiCore
 *
 */

var ParatiiCore = exports.ParatiiCore = function ParatiiCore(config) {
  (0, _classCallCheck3.default)(this, ParatiiCore);

  var defaults = {
    'db.provider': null
  };
  var options = dopts(config, defaults, { allowUnknown: true });
  this.config = options;

  this.vids = new _paratiiCoreVids.ParatiiCoreVids(this.config);
  this.users = new _paratiiCoreUsers.ParatiiCoreUsers(this.config);
};