'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiCore = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _paratiiCoreVids = require('./paratii.core.vids.js');

var _paratiiCoreUsers = require('./paratii.core.users.js');

var _schemas = require('./schemas.js');

var _joi = require('joi');

var _joi2 = _interopRequireDefault(_joi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Contains functions that operate transversally over several backend systems. <br />
 * validates the config file and istantiates ParatiiCoreVids and ParatiiCoreUsers.
 * @param {Object} config configuration object to initialize Paratii object
 */
var ParatiiCore = exports.ParatiiCore = function () {
  function ParatiiCore(config) {
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
  }

  /**
   * migrate all contract data for  paratii.config.account to a new account
   */


  (0, _createClass3.default)(ParatiiCore, [{
    key: 'migrateAccount',
    value: function migrateAccount(newAccount) {
      var oldAccount, vids, i, vid, ptiBalance;
      return _regenerator2.default.async(function migrateAccount$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              // migrate the videos
              oldAccount = this.config.account.address;
              _context.next = 3;
              return _regenerator2.default.awrap(this.vids.search({ owner: oldAccount }));

            case 3:
              vids = _context.sent;
              _context.t0 = _regenerator2.default.keys(vids);

            case 5:
              if ((_context.t1 = _context.t0()).done) {
                _context.next = 14;
                break;
              }

              i = _context.t1.value;
              vid = vids[i];
              _context.next = 10;
              return _regenerator2.default.awrap(this.vids.update(vid.id, { owner: newAccount }));

            case 10:
              _context.next = 12;
              return _regenerator2.default.awrap(this.paratii.eth.tcr.exit(vid.id));

            case 12:
              _context.next = 5;
              break;

            case 14:
              _context.next = 16;
              return _regenerator2.default.awrap(this.paratii.eth.balanceOf(oldAccount, 'PTI'));

            case 16:
              ptiBalance = _context.sent;

              console.log(ptiBalance);
              _context.next = 20;
              return _regenerator2.default.awrap(this.paratii.eth.transfer(newAccount, ptiBalance, 'PTI'));

            case 20:
            case 'end':
              return _context.stop();
          }
        }
      }, null, this);
    }
  }]);
  return ParatiiCore;
}();