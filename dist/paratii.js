'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiEth = exports.ParatiiDb = exports.ParatiiIPFS = exports.utils = exports.Paratii = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _paratiiCore = require('./paratii.core.js');

var _paratiiDb = require('./paratii.db.js');

var _paratiiEth = require('./paratii.eth.js');

var _paratiiIpfs = require('./paratii.ipfs.js');

var _paratiiTranscoder = require('./paratii.transcoder.js');

var _schemas = require('./schemas.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var joi = require('joi');
var utils = require('./utils.js');

/**
 * Paratii library main object
 * The Paratii object serves as the general entry point for interacting with the family of Paratii
 * contracts that are deployed on the blockchain, utilities to run and interact with a local IPFS node,
 * and utilities to interact with the Paratii index.

 * @param {ParatiiConfigSchema} opts options object to configure paratii library
 * @property {ParatiiCoreVids} vids operations on videos
 * @property {ParatiiCoreUsers} users operations on users
 * @property {ParatiiEth} eth interact with the Ethereum blockchain
 * @property {ParatiiIPFS} ipfs interact with the IPFS instance
 * @property {ParatiiDb} db interact with the Paratii Index
 * @property {ParatiiTranscoder} transcoder commands for transcoding files
 * @example import Paratii from 'paratii-js'
 * paratii = new Paratii({
 *  eth: {
 *    provider': 'http://localhost:8545'
 *   },
 *   account: {
 *     address: 'your-address'
 *   }
 * })
 */

var Paratii = function (_ParatiiCore) {
  (0, _inherits3.default)(Paratii, _ParatiiCore);

  /**
    * @typedef {Array} ParatiiConfigSchema
    * @property {?accountSchema} account
    * @property {?ethSchema} eth
    * @property {?dbSchema} db
    * @property {?ipfsSchema} ipfs
   */
  function Paratii() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck3.default)(this, Paratii);

    var schema = joi.object({
      account: _schemas.accountSchema,
      eth: _schemas.ethSchema,
      db: _schemas.dbSchema,
      ipfs: _schemas.ipfsSchema
    });

    var result = joi.validate(opts, schema);
    if (result.error) throw result.error;
    var config = result.value;

    var _this = (0, _possibleConstructorReturn3.default)(this, (Paratii.__proto__ || (0, _getPrototypeOf2.default)(Paratii)).call(this, config));

    _this.config = config;
    _this.config.paratii = _this;
    // this.core = this
    _this.eth = new _paratiiEth.ParatiiEth(_this.config);
    // this.core = new ParatiiCore(this.config)
    _this.db = new _paratiiDb.ParatiiDb(_this.config);
    _this.ipfs = new _paratiiIpfs.ParatiiIPFS(_this.config);
    _this.transcoder = new _paratiiTranscoder.ParatiiTranscoder(_this.config);
    return _this;
  }
  /**
  * Sets the account that will be used to sign all transactions
  * @param {?string} address    public address
  * @param {?string} privateKey private key related to the previous public address
  * @param {?string} mnemonic   mnemonic related to the previous public address
  * @example paratii.eth.setAccount(null,'some-private-key')
  * @example paratii.eth.setAccount('some-address', null, 'some-mnemonic')
  */
  // FIXME: we should take an object as arguments here


  (0, _createClass3.default)(Paratii, [{
    key: 'setAccount',
    value: function setAccount(address, privateKey, mnemonic) {
      this.eth.setAccount(address, privateKey, mnemonic);
    }
    /**
     * Gets the ethereum address that is used to sign all the transactions
     * @example let account = paratii.getAccount()
     */

  }, {
    key: 'getAccount',
    value: function getAccount() {
      this.eth.getAccount();
    }
    /**
     * Get some diagnostic info about the state of the system
     * @return {Promise} that resolves in an array of strings with diagnostic info
     * @example let diagnosticInfo = await paratii.diagnose()
     * console.log(diagnosticInfo)
     */

  }, {
    key: 'diagnose',
    value: function diagnose() {
      var msg, address, msgs, isOk, log, registry, name;
      return _regenerator2.default.async(function diagnose$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              log = function log(msg) {
                msgs.push(msg);
              };

              msg = void 0, address = void 0, msgs = void 0;
              isOk = true;

              msgs = [];

              log('Paratii was initialized with the following options:');
              log(this.config);
              log('Checking main account');
              if (this.config.account.address && this.config.account.privateKey) {
                log('Your private key: ' + this.config.account.privateKey);
                log('Your private key: ' + this.config.account.privateKey);
                log('First wallet account: ' + this.eth.web3.eth.accounts.wallet[0].address);
              }
              address = this.eth.getRegistryAddress();

              if (address) {
                _context.next = 15;
                break;
              }

              log('*** No registry address found!');
              log('Value of this.config[\'eth.registryAddress\']: ' + this.config['eth.registryAddress']);
              isOk = false;
              _context.next = 35;
              break;

            case 15:
              log('checking deployed code of Registry...');
              _context.next = 18;
              return _regenerator2.default.awrap(this.eth.web3.eth.getCode(address));

            case 18:
              msg = _context.sent;

              if (msg === '0x') {
                log('ERROR: no code was found on the registry address ' + address);
                log(msg);
              } else {
                log('... seems ok...');
                // log(`We found the following code on the registry address ${address}`)
                // log(msg)
              }
              log('checking for addresses on registry@' + address);
              _context.next = 23;
              return _regenerator2.default.awrap(this.eth.getContract('Registry'));

            case 23:
              registry = _context.sent;

              log('(registry address is ' + registry.options.address + ')');
              _context.t0 = _regenerator2.default.keys(this.eth.contracts);

            case 26:
              if ((_context.t1 = _context.t0()).done) {
                _context.next = 35;
                break;
              }

              name = _context.t1.value;

              if (!(name !== 'Registry')) {
                _context.next = 33;
                break;
              }

              _context.next = 31;
              return _regenerator2.default.awrap(registry.methods.getContract(name).call());

            case 31:
              address = _context.sent;

              log('address of ' + name + ': ' + address);

            case 33:
              _context.next = 26;
              break;

            case 35:
              if (isOk) {
                log('---- everything seems fine -----');
              } else {
                log('***** Something is wrong *****');
              }
              return _context.abrupt('return', msgs);

            case 37:
            case 'end':
              return _context.stop();
          }
        }
      }, null, this);
    }
  }]);
  return Paratii;
}(_paratiiCore.ParatiiCore);

exports.default = Paratii;
exports.Paratii = Paratii;
exports.utils = utils;
exports.ParatiiIPFS = _paratiiIpfs.ParatiiIPFS;
exports.ParatiiDb = _paratiiDb.ParatiiDb;
exports.ParatiiEth = _paratiiEth.ParatiiEth;