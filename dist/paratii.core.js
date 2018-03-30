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

// const joi = require('joi')

/**
 * Contains functions that operate transversally over several backend systems. <br />
 * validates the config file and istantiates ParatiiCoreVids and ParatiiCoreUsers.
 * @param {Object} config configuration object to initialize Paratii object
 */
var ParatiiCore = exports.ParatiiCore = function ParatiiCore(config) {
  (0, _classCallCheck3.default)(this, ParatiiCore);

  // const schema = joi.object({
  //   'db.provider': joi.string()
  // }).unknown()
  //
  // const result = joi.validate(config, schema)
  // const error = result.error
  // if (error) throw error
  // this.config = result.value
  this.config = config;

  this.vids = new _paratiiCoreVids.ParatiiCoreVids(this.config);
  this.users = new _paratiiCoreUsers.ParatiiCoreUsers(this.config);
};