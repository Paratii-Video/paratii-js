'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiDb = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _paratiiDbVids = require('./paratii.db.vids.js');

var _paratiiDbUsers = require('./paratii.db.users.js');

var _schemas = require('./schemas.js');

var _joi = require('joi');

var _joi2 = _interopRequireDefault(_joi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Needed to check the DB provider status code
var request = require('request');

/**
 * ParatiiDb contains a functionality to interact with the Paratii Index.
 * @param {ParatiiDbSchema} config configuration object to initialize Paratii object
 * @property {ParatiiDbVids} vids operations on videos
 * @property {ParatiiDbUsers} users operations on users
 */

var ParatiiDb = exports.ParatiiDb = function () {
  /**
  * @typedef ParatiiDbSchema
  * @property {dbSchema} db
  * @property {accountSchema} account
  */
  function ParatiiDb(config) {
    (0, _classCallCheck3.default)(this, ParatiiDb);

    var schema = {
      db: _schemas.dbSchema,
      account: _schemas.accountSchema
    };
    var result = _joi2.default.validate(config, schema, { allowUnknown: true });
    if (result.error) throw result.error;

    this.config = config;
    this.config.db = result.value.db;
    this.config.account = result.value.account;
    this.vids = new _paratiiDbVids.ParatiiDbVids(this.config);
    this.users = new _paratiiDbUsers.ParatiiDbUsers(this.config);
  }
  /**
   * Requests a link to see if it's up (Easily adds a dozen seconds to check the status)
   * @return {Promise} that resolves in a boolean
   */


  (0, _createClass3.default)(ParatiiDb, [{
    key: 'checkDBProviderStatus',
    value: function checkDBProviderStatus() {
      var _this = this;

      return _regenerator2.default.async(function checkDBProviderStatus$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              return _context.abrupt('return', new _promise2.default(function (resolve) {
                request(_this.config.db.provider, function (error, response) {
                  if (error) {
                    resolve(false);
                  } else if (response && response.statusCode === 200) {
                    // We suppose for now that only 200 is the right status code (see: https://en.wikipedia.org/wiki/List_of_HTTP_status_codes)
                    resolve(true);
                  } else {
                    resolve(false);
                  }
                });
              }));

            case 1:
            case 'end':
              return _context.stop();
          }
        }
      }, null, this);
    }
  }]);
  return ParatiiDb;
}();