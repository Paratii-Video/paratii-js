'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiDb = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _paratiiDbVids = require('./paratii.db.vids.js');

var _paratiiDbUsers = require('./paratii.db.users.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var dopts = require('default-options');
/**
 * ParatiiDb contains a functionality to interact with the Paratii Blockchain Index
 *
 */

var ParatiiDb = exports.ParatiiDb = function ParatiiDb(config) {
  (0, _classCallCheck3.default)(this, ParatiiDb);

  var defaults = {
    'db.provider': null
  };
  var options = dopts(config, defaults, { allowUnknown: true });
  this.config = options;

  this.vids = new _paratiiDbVids.ParatiiDbVids(this.config);
  this.users = new _paratiiDbUsers.ParatiiDbUsers(this.config);
};