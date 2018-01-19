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

var dopts = require('default-options');
var utils = require('./utils.js');

/**
 * Paratii Library
 * for usage, see https://github.com/Paratii-Video/paratii-contracts/tree/master/docs
 *
 */

var Paratii = function () {
  function Paratii() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck3.default)(this, Paratii);

    var defaults = {
      provider: 'http://localhost:8545',
      registryAddress: null,
      address: null, //  Ethereum address
      privateKey: null,
      mnemonic: null,
      'repo': null,
      'db.provider': String
    };
    var options = dopts(opts, defaults);

    this.config = {};
    this.config.provider = options.provider;
    this.config.repo = options.repo;

    if (this.config.provider === 'http://localhost:8545') {
      this.config.isTestNet = true;
    } else if (this.config.provider === 'http://127.0.0.1:8545') {
      this.config.isTestNet = true;
    } else {
      this.config.isTestNet = false;
    }

    this.config.registryAddress = options.registryAddress;

    if (options.address) {
      this.config.account = {
        address: options.address,
        privateKey: options.privateKey
      };
    } else {
      this.config.account = {
        address: null,
        privateKey: null
      };
    }

    this.config.paratii = this;
    this.core = new _paratiiCore.ParatiiCore(this.config);
    this.db = new _paratiiDb.ParatiiDb(this.config);
    this.eth = new _paratiiEth.ParatiiEth(this.config);
    this.ipfs = new _paratiiIpfs.ParatiiIPFS(this.config);
  }

  (0, _createClass3.default)(Paratii, [{
    key: 'setAccount',
    value: function setAccount(address, privateKey) {
      this.config.account = {
        address: address,
        privateKey: privateKey
      };
      if (privateKey) {
        this.web3.eth.accounts.wallet.add(privateKey);
      }
    }
  }, {
    key: 'setRegistryAddress',
    value: function setRegistryAddress(address) {
      return this.eth.setRegistryAddress(address);
    }
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

              // return an array of strings with diagnostic info

              msg = void 0, address = void 0, msgs = void 0;
              isOk = true;

              msgs = [];

              log('Paratii was initialized with the following options:');
              log(this.config);
              address = this.eth.getRegistryAddress();

              if (address) {
                _context.next = 13;
                break;
              }

              log('*** No registry address found!');
              log('Value of this.config.registryAddress: ' + this.config.registryAddress);
              isOk = false;
              _context.next = 32;
              break;

            case 13:
              log('checking deployed code of Registry...');
              _context.next = 16;
              return _regenerator2.default.awrap(this.eth.web3.eth.getCode(address));

            case 16:
              msg = _context.sent;

              if (msg === '0x') {
                log('ERROR: no code was found on the registry address ' + address);
                log(msg);
              } else {
                log('... seems ok...');
                // log(`We found the following code on the registry address ${address}`)
                // log(msg)
              }
              log('checking for addresses');
              _context.next = 21;
              return _regenerator2.default.awrap(this.eth.getContract('Registry'));

            case 21:
              registry = _context.sent;
              _context.t0 = _regenerator2.default.keys(this.eth.contracts);

            case 23:
              if ((_context.t1 = _context.t0()).done) {
                _context.next = 32;
                break;
              }

              name = _context.t1.value;

              if (!(name !== 'Registry')) {
                _context.next = 30;
                break;
              }

              _context.next = 28;
              return _regenerator2.default.awrap(registry.methods.getContract(name).call());

            case 28:
              address = _context.sent;

              log('address of ' + name + ': ' + address);

            case 30:
              _context.next = 23;
              break;

            case 32:
              if (isOk) {
                log('---- everything seems fine -----');
              } else {
                log('***** Something is wrong *****');
              }
              return _context.abrupt('return', msgs);

            case 34:
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