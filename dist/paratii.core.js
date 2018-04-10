'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiCore = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _paratiiCoreVids = require('./paratii.core.vids.js');

var _paratiiCoreUsers = require('./paratii.core.users.js');

var _schemas = require('./schemas.js');

var _joi = require('joi');

var _joi2 = _interopRequireDefault(_joi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Contains functions that operate transversally over several backend systems. <br />
 * validates the config file and istantiates ParatiiCoreVids and ParatiiCoreUsers.
 * @param {ParatiiCoreSchema} config configuration object to initialize Paratii object
 * @property {ParatiiCoreVids} vids operations on videos
 * @property {ParatiiCoreUsers} users operations on users
 * @property {Paratii} paratii main Paratii Object
 */
var ParatiiCore =
/**
* @typedef {Array} ParatiiCoreSchema
* @property {?accountSchema} account
* @property {?ethSchema} eth
* @property {?dbSchema} db
* @property {?ipfsSchema} ipfs
* @property {?Object} paratii
*/
exports.ParatiiCore = function ParatiiCore(config) {
  (0, _classCallCheck3.default)(this, ParatiiCore);

  var schema = _joi2.default.object({
    account: _schemas.accountSchema,
    eth: _schemas.ethSchema,
    db: _schemas.dbSchema,
    ipfs: _schemas.ipfsSchema,
    paratii: _joi2.default.object().optional()
  });
  var result = _joi2.default.validate(config, schema);
  if (result.error) throw result.error;
  this.config = config;
  // this.config = result.value
  this.vids = new _paratiiCoreVids.ParatiiCoreVids(this.config);
  this.users = new _paratiiCoreUsers.ParatiiCoreUsers(this.config);
  this.paratii = this.config.paratii;
};