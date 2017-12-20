'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var dopts = require('default-options');

/**
 * ParatiiCoreUsers
 *
 */

var ParatiiCoreUsers = exports.ParatiiCoreUsers = function ParatiiCoreUsers(config) {
  _classCallCheck(this, ParatiiCoreUsers);

  var defaults = {
    'db.provider': null
  };
  var options = dopts(config, defaults, { allowUnknown: true });
  this.config = options;
};