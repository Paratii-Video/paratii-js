'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiCoreUsers = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var dopts = require('default-options');

/**
 * ParatiiCoreUsers
 *
 */

var ParatiiCoreUsers = exports.ParatiiCoreUsers = function ParatiiCoreUsers(config) {
  (0, _classCallCheck3.default)(this, ParatiiCoreUsers);

  var defaults = {
    'db.provider': null
  };
  var options = dopts(config, defaults, { allowUnknown: true });
  this.config = options;
};