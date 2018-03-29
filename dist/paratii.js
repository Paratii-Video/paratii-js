'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiEth = exports.ParatiiDb = exports.ParatiiIPFS = exports.utils = exports.Paratii = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _paratiiCore = require('./paratii.core.js');

var _paratiiDb = require('./paratii.db.js');

var _paratiiEth = require('./paratii.eth.js');

var _paratiiIpfs = require('./paratii.ipfs.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var joi = require('joi');
var utils = require('./utils.js');

/**
 * Paratii library main object
 * The Paratii object serves as the general entry point for interacting with the family of Paratii
 * contracts that are deployed on the blockchain, utilities to run and interact with a local IPFS node,
 * and utilities to interact with the Paratii index.
 * @param {Object} opts options object to configure paratii library
 * @param {String} opts.provider optional - the address of an ethereum node (defaults to localhost:8754)
 * @param {String} opts.registryAddress optional - the address where the Paratii Contract registry can be found
 * @param {String} opts.address optional - address of the operator/user
 * @param {String} opts.privateKey optional - private key of the user
 * @param {Object} opts.ipfs TODO fix ipfs.repo --> ipfsrepo
 * @param {String} opts.ipfs.repo optional - namespace of the ipfs repository
 * @param {Object} opts.db TODO fix db.provider --> dbprovider
 * @param {String} opts.db.provider optional - baseURL of the mongoDb mirror
 * @param {String} opts.mnemonic optional - mnemonic of the user
 *
 * @example     paratii = new Paratii({ 'eth.provider': 'http://localhost:8545', address: 'some-user-id', privateKey: 'some-user-priv-key'})
 */

var Paratii = function () {
  function Paratii() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck3.default)(this, Paratii);

    var schema = joi.object({
      'eth.provider': joi.string().default('ws://localhost:8546'),
      'eth.registryAddress': joi.string().default(null),
      address: joi.string().default(null),
      privateKey: joi.string().default(null),
      mnemonic: joi.string().default(null),
      'ipfs.repo': joi.string().default('/tmp/paratii-alpha-' + String(Math.random())),
      'db.provider': joi.string()
    });

    var result = joi.validate(opts, schema);
    var error = result.error;
    if (error) throw error;
    var options = result.value;

    this.config = {};
    this.config['eth.provider'] = options['eth.provider'];
    this.config['ipfs.repo'] = options['ipfs.repo'];
    this.config['db.provider'] = options['db.provider'];

    if (this.config['eth.provider'].match(/(localhost|127\.0\.0\.1)/g)) {
      this.config.isTestNet = true;
    } else {
      this.config.isTestNet = false;
    }

    this.config.account = {
      address: options.address,
      privateKey: options.privateKey,
      mnemonic: options.mnemonic
    };
    this.config['eth.registryAddress'] = options['eth.registryAddress'];

    this.config.paratii = this;
    this.core = new _paratiiCore.ParatiiCore(this.config);
    this.db = new _paratiiDb.ParatiiDb(this.config);
    this.eth = new _paratiiEth.ParatiiEth(this.config);
    this.ipfs = new _paratiiIpfs.ParatiiIPFS(this.config);
  }
  /**
   * Set the ethereum address what will be used to sign all transactions
   * @param {String} address address of the operator/user
   * @param {String} privateKey optional - private key of the operator/user
   * @example paratii.setAccount('some-user-id','some-user-pub-key')
   */


  (0, _createClass3.default)(Paratii, [{
    key: 'setAccount',
    value: function setAccount(address, privateKey) {
      this.eth.setAccount(address, privateKey);
    }
    /**
     * Set the address of the ParatiiRegistry contract
     * @param {String} address address of the ParatiiRegistry contract
     * @example paratii.setRegistryAddress('some-address')
    */

  }, {
    key: 'setRegistryAddress',
    value: function setRegistryAddress(address) {
      return this.eth.setRegistryAddress(address);
    }

    /**
     * return an array of strings with diagnostic info
     * @return {Promise} array of strings with diagnostic info
     * @example paratii.diagnose()
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
}();

exports.Paratii = Paratii;
exports.utils = utils;
exports.ParatiiIPFS = _paratiiIpfs.ParatiiIPFS;
exports.ParatiiDb = _paratiiDb.ParatiiDb;
exports.ParatiiEth = _paratiiEth.ParatiiEth;