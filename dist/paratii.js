'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiEth = exports.ParatiiDb = exports.ParatiiIPFS = exports.utils = exports.Paratii = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

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

var _schemas = require('./schemas.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var joi = require('joi');
// import { ParatiiTranscoder } from './paratii.transcoder.js'

var utils = require('./utils.js');

// Needed to open a socket connection
var net = require('net');

/**
 * Paratii library main object
 * The Paratii object serves as the general entry point for interacting with the family of Paratii
 * contracts that are deployed on the blockchain, utilities to run and interact with a local IPFS node,
 * and utilities to interact with the Paratii index.

 * @param {ParatiiConfigSchema} opts options object to configure paratii library
 * @property {ParatiiConfigSchema} config where the configuration of the paratii object is stored
 * @property {ParatiiVids} vids operations on videos
 * @property {ParatiiUsers} users operations on users
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
    * @property {accountSchema=} account settings regarding your the Ethereum account
    * @property {ethSchema=} eth setings regarding the Ethereum blockchain
    * @property {dbSchema=} db settings regarding the database index
    * @property {ipfsSchema=} ipfs settings regardig IPFS
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
    _this.eth = new _paratiiEth.ParatiiEth(_this.config);
    _this.db = new _paratiiDb.ParatiiDb(_this.config);
    _this.ipfs = new _paratiiIpfs.ParatiiIPFS(_this.config);
    // this.transcoder = new ParatiiTranscoder(this.config)
    _this.transcoder = _this.ipfs.transcoder;
    return _this;
  }

  /**
  * Sets the account that will be used to sign all transactions
  * @param {accountSchema} opts
  * @example paratii.eth.setAccount({address: '0xdF7EacFfb8F1C5F65CDD7d045A608DeBa980d473'})
  * @example paratii.setAccount({privateKey: '0x399b141d0cc2b863b2f514ffe53edc6afc9416d5899da4d9bd2350074c38f1c6'})
  */

  // FIXME: we should take an object as arguments here


  (0, _createClass3.default)(Paratii, [{
    key: 'setAccount',
    value: function setAccount(opts) {
      this.eth.setAccount(opts);
    }
    /**
     * Gets the ethereum address that is used to sign all the transactions
     * @example let account = paratii.getAccount()
     */

  }, {
    key: 'getAccount',
    value: function getAccount() {
      return this.eth.getAccount();
    }
    /**
     * Checks the bootstrap dns nodes
     * @param {string} baseUrl url of the web socket server
     * @param {Number} port the port at which the web socket is listening to
     * @return {Promise} that resolves in a boolean
     */

  }, {
    key: 'checkBootstrapWebSocketDNS',
    value: function checkBootstrapWebSocketDNS(baseUrl, port) {
      return _regenerator2.default.async(function checkBootstrapWebSocketDNS$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              return _context.abrupt('return', new _promise2.default(function (resolve) {
                var client = new net.Socket();
                client.setTimeout(30000); // Arbitrary 30 secondes to be able to reach DNS server
                client.connect(port, baseUrl, function () {
                  client.end();
                  resolve(true);
                });
                client.on('error', function (err) {
                  if (err) {
                    client.end();
                    resolve(false);
                  } else {
                    client.end();
                    resolve(false);
                  }
                });
                client.on('timeout', function () {
                  client.end();
                  resolve(false);
                });
              }));

            case 1:
            case 'end':
              return _context.stop();
          }
        }
      }, null, this);
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
      var msg, address, msgs, isOk, log, registry, name, pEth, ipfsState, dbProviderStatus, transcoderDropUrlStatus, splitDefaultTranscoder, checkDefaultTranscoder, splitRemoteIPFSNode, checkRemoteIPFSNode;
      return _regenerator2.default.async(function diagnose$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              log = function log(msg) {
                msgs.push(msg);
              };

              msg = void 0, address = void 0, msgs = void 0;
              isOk = true;

              msgs = [];

              // Displaying the configuration
              log('Paratii was initialized with the following options:');
              log(this.config);
              // Main account check
              log('Checking main account');
              if (this.config.account.address && this.config.account.privateKey) {
                log('Your private key: ' + this.config.account.privateKey);
                log('Your private key: ' + this.config.account.privateKey);
                log('First wallet account: ' + this.eth.web3.eth.accounts.wallet[0].address);
              }
              // Test registry address
              address = this.eth.getRegistryAddress();

              if (address) {
                _context2.next = 15;
                break;
              }

              log('*** No registry address found!');
              log('Value of this.config[\'eth.registryAddress\']: ' + this.config['eth.registryAddress']);
              isOk = false;
              _context2.next = 35;
              break;

            case 15:
              log('checking deployed code of Registry...');
              _context2.next = 18;
              return _regenerator2.default.awrap(this.eth.web3.eth.getCode(address));

            case 18:
              msg = _context2.sent;

              if (msg === '0x') {
                log('ERROR: no code was found on the registry address ' + address);
                log(msg);
              } else {
                log('... seems ok...');
                // log(`We found the following code on the registry address ${address}`)
                // log(msg)
              }
              log('checking for addresses on registry@' + address);
              _context2.next = 23;
              return _regenerator2.default.awrap(this.eth.getContract('Registry'));

            case 23:
              registry = _context2.sent;

              log('(registry address is ' + registry.options.address + ')');
              _context2.t0 = _regenerator2.default.keys(this.eth.contracts);

            case 26:
              if ((_context2.t1 = _context2.t0()).done) {
                _context2.next = 35;
                break;
              }

              name = _context2.t1.value;

              if (!(name !== 'Registry')) {
                _context2.next = 33;
                break;
              }

              _context2.next = 31;
              return _regenerator2.default.awrap(registry.methods.getContract(name).call());

            case 31:
              address = _context2.sent;

              log('address of ' + name + ': ' + address);

            case 33:
              _context2.next = 26;
              break;

            case 35:
              // Pinging Eth provider
              log('Pinging the eth provider');
              _context2.next = 38;
              return _regenerator2.default.awrap(this.eth.checkEth());

            case 38:
              pEth = _context2.sent;

              if (pEth === true) {
                log('The eth provider responds correctly.');
              } else {
                isOk = false;
                log('There seems to be a problem reaching the eth provider.');
              }
              // Check if IPFS node is running
              log('Check if IPFS node is running');
              _context2.next = 43;
              return _regenerator2.default.awrap(this.ipfs.checkIPFSState());

            case 43:
              ipfsState = _context2.sent;

              if (ipfsState === true) {
                log('The IPFS node seems to be running correctly.');
              } else {
                isOk = false;
                log('The IPFS node doesn\'t seem to be running.');
              }
              // Check if DB provider is up
              log('Check if the DB provider is up.');
              _context2.next = 48;
              return _regenerator2.default.awrap(this.db.checkDBProviderStatus());

            case 48:
              dbProviderStatus = _context2.sent;

              if (dbProviderStatus === true) {
                log('Able to reach the DB provder.');
              } else {
                isOk = false;
                log('Can\'t reach the DB provider.');
              }
              // Check if transcoder drop url is responding
              log('Check if transcoder drop url is responding.');
              _context2.next = 53;
              return _regenerator2.default.awrap(this.ipfs.remote.checkTranscoderDropUrl());

            case 53:
              transcoderDropUrlStatus = _context2.sent;

              if (transcoderDropUrlStatus === true) {
                log('Able to reach the transcoder.');
              } else {
                isOk = false;
                log('Can\'t reach the transcoder.');
              }
              // Check if the default transcoder is responding
              log('Check if the default transcoder is responding.');
              splitDefaultTranscoder = this.config.ipfs.defaultTranscoder.split('/');
              _context2.next = 59;
              return _regenerator2.default.awrap(this.checkBootstrapWebSocketDNS(splitDefaultTranscoder[2], splitDefaultTranscoder[4]));

            case 59:
              checkDefaultTranscoder = _context2.sent;

              if (checkDefaultTranscoder === true) {
                log('Able to reach the default transcoder dns.');
              } else {
                isOk = false;
                log('Can\'t reach the default transcoder dns.');
              }
              // Check if the remote IPFS node is responding
              log('Check if the remote IPFS node is responding.');
              splitRemoteIPFSNode = this.config.ipfs.remoteIPFSNode.split('/');
              _context2.next = 65;
              return _regenerator2.default.awrap(this.checkBootstrapWebSocketDNS(splitRemoteIPFSNode[2], splitRemoteIPFSNode[4]));

            case 65:
              checkRemoteIPFSNode = _context2.sent;

              if (checkRemoteIPFSNode === true) {
                log('Able to reach the remote IPFS node dns.');
              } else {
                isOk = false;
                log('Can\'t reach the remote IPFS node dns.');
              }
              // Todo Optimize the calls by running all the awaits at the same time
              // Recap
              if (isOk) {
                log('---- everything seems fine -----');
              } else {
                log('***** Something is wrong *****');
              }
              return _context2.abrupt('return', msgs);

            case 69:
            case 'end':
              return _context2.stop();
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