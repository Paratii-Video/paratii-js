'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiCore = undefined;

var _paratiiCoreVids = require('./paratii.core.vids.js');

var _paratiiCoreUsers = require('./paratii.core.users.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var dopts = require('default-options');

/**
 * ParatiiCore
 *
 */

var ParatiiCore = exports.ParatiiCore = function ParatiiCore(config) {
  _classCallCheck(this, ParatiiCore);

  var defaults = {
    'db.provider': null
  };
  var options = dopts(config, defaults, { allowUnknown: true });
  this.config = options;

  this.vids = new _paratiiCoreVids.ParatiiCoreVids(this.config);
  this.users = new _paratiiCoreUsers.ParatiiCoreUsers(this.config);
};