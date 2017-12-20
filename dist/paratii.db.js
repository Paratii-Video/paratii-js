'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var dopts = require('default-options');

/**
 * ParatiiDb contains a functionality to interact with the Paratii Blockchain Index
 *
 */

var ParatiiDb = exports.ParatiiDb = function ParatiiDb(config) {
  _classCallCheck(this, ParatiiDb);

  var defaults = {};
  var options = dopts(config, defaults, { allowUnknown: true });
  this.config = config;
  console.log(options);
};