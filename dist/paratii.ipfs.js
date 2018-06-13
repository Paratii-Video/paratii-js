'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiIPFS = undefined;

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _setImmediate2 = require('babel-runtime/core-js/set-immediate');

var _setImmediate3 = _interopRequireDefault(_setImmediate2);

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

var _paratiiProtocol = require('paratii-protocol');

var _paratiiProtocol2 = _interopRequireDefault(_paratiiProtocol);

var _schemas = require('./schemas.js');

var _joi = require('joi');

var _joi2 = _interopRequireDefault(_joi);

var _events = require('events');

var _paratiiIpfsRemote = require('./paratii.ipfs.remote.js');

var _paratiiIpfsLocal = require('./paratii.ipfs.local.js');

var _paratiiTranscoder = require('./paratii.transcoder.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import { PromiseEventEmitter } from './utils.js'

global.Buffer = global.Buffer || require('buffer').Buffer;

/**
 * Contains functions to interact with the IPFS instance
 * @param {ParatiiIPFSSchema} config configuration object to initialize Paratii object
 * @property {ParatiiIPFSLocal} local operations on the local node
 * @property {ParatiiIPFSRemote} remote operations on remote node
 */
/* global ArrayBuffer */

var ParatiiIPFS = exports.ParatiiIPFS = function (_EventEmitter) {
  (0, _inherits3.default)(ParatiiIPFS, _EventEmitter);

  /**
  * @typedef {Array} ParatiiIPFSSchema
  * @property {ipfsSchema=} ipfs
  * @property {accountSchema=} account
  * @property {boolean=} verbose
  */
  function ParatiiIPFS(config) {
    (0, _classCallCheck3.default)(this, ParatiiIPFS);

    var _this = (0, _possibleConstructorReturn3.default)(this, (ParatiiIPFS.__proto__ || (0, _getPrototypeOf2.default)(ParatiiIPFS)).call(this));

    var schema = _joi2.default.object({
      ipfs: _schemas.ipfsSchema,
      account: _schemas.accountSchema,
      verbose: _joi2.default.bool().default(true),
      expressUploading: _joi2.default.bool().default(true)
    });

    var result = _joi2.default.validate(config, schema, { allowUnknown: true });
    if (result.error) throw result.error;
    _this.config = config;
    _this.config.ipfs = result.value.ipfs;
    _this.config.account = result.value.account;
    _this.config.expressUploading = result.value.expressUploading;
    // TODO change this to some other name. this is wrong.
    // because `this` isn't an ipfs instance.
    _this.config.ipfsInstance = _this;
    _this.remote = new _paratiiIpfsRemote.ParatiiIPFSRemote({ ipfs: _this.config.ipfs, paratiiIPFS: _this });
    _this.local = new _paratiiIpfsLocal.ParatiiIPFSLocal({ config: config, ParatiiIPFS: _this });
    _this.local.remote = _this.remote;
    _this.transcoder = new _paratiiTranscoder.ParatiiTranscoder({ ipfs: _this.config.ipfs, paratiiIPFS: _this });
    return _this;
  }

  /**
   * Starts the IPFS node
   * @return {Promise} that resolves in an IPFS instance
   * @example paratii.ipfs.start()
   */


  (0, _createClass3.default)(ParatiiIPFS, [{
    key: 'start',
    value: function start() {
      var _this2 = this;

      return new _promise2.default(function (resolve, reject) {
        if (_this2.ipfs && _this2.ipfs.isOnline()) {
          // console.log('IPFS is already running')
          return resolve(_this2.ipfs);
        }

        _this2.getIPFSInstance().then(function (ipfs) {
          resolve(ipfs);
        });
      });
    }

    /**
     * Stops the IPFS node.
     * @example paratii.ipfs.stop()
     */

  }, {
    key: 'stop',
    value: function stop() {
      var _this3 = this;

      return new _promise2.default(function (resolve, reject) {
        if (!_this3.ipfs || !_this3.ipfs.isOnline()) {
          resolve();
        }
        if (_this3.ipfs) {
          _this3.ipfs.stop(function () {
            (0, _setImmediate3.default)(function () {
              resolve();
            });
          });
        }
      });
    }
  }, {
    key: '_getAccount',
    value: function _getAccount() {
      return this.config.paratii && this.config.paratii.eth.getAccount() || 'unknown';
    }

    /**
     * adds a JSON structure to the local node and signals remote node to pin it
     * @param  {object}  data JSON object to store
     * @return {string}      returns ipfs multihash of the stored object.
     * @example let result = await paratiiIPFS.addAndPinJSON(data)
     */

  }, {
    key: 'addAndPinJSON',
    value: function addAndPinJSON(data) {
      var _this4 = this;

      var hash, pinEv;
      return _regenerator2.default.async(function addAndPinJSON$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return _regenerator2.default.awrap(this.local.addJSON(data));

            case 2:
              hash = _context2.sent;
              pinEv = this.remote.pinFile(hash, { author: this._getAccount() });


              pinEv.on('pin:error', function (err) {
                console.warn('pin:error:', hash, ' : ', err);
                console.log('trying again');
                // pinEv = pinFile()
              });

              pinEv.on('pin:done', function _callee(hash) {
                return _regenerator2.default.async(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                      case 'end':
                        return _context.stop();
                    }
                  }
                }, null, _this4);
              }
              // resolve(hash)
              );

              return _context2.abrupt('return', hash);

            case 7:
            case 'end':
              return _context2.stop();
          }
        }
      }, null, this);
    }

    /**
     * log messages on the console if verbose is set
     * @param  {string} msg text to log
     * @example
     * paratii.ipfs.log("some-text")
     * @private
     */

  }, {
    key: 'log',
    value: function log() {
      if (this.config.verbose) {
        var _console;

        (_console = console).log.apply(_console, arguments);
      }
    }
    /**
     * log warns on the console if verbose is set
     * @param  {string} msg warn text
     * @example
     * paratii.ipfs.warn("some-text")
     * @private
     */

  }, {
    key: 'warn',
    value: function warn() {
      if (this.config.verbose) {
        var _console2;

        (_console2 = console).warn.apply(_console2, arguments);
      }
    }
    /**
     * log errors on the console if verbose is set
     * @param  {string} msg error message
     * @example
     * paratii.ipfs.error("some-text")
     * @private
     */

  }, {
    key: 'error',
    value: function error() {
      if (this.config.verbose) {
        var _console3;

        (_console3 = console).error.apply(_console3, arguments);
      }
    }
    /**
     * get an ipfs instance of jsipfs. Singleton pattern
     * @return {Object} Ipfs instance
     * @example ipfs = await paratii.ipfs.getIPFSInstance()
     * @private
     */

  }, {
    key: 'getIPFSInstance',
    value: function getIPFSInstance() {
      var _this5 = this;

      return new _promise2.default(function (resolve, reject) {
        if (_this5.ipfs) {
          resolve(_this5.ipfs);
        } else {
          var config = _this5.config;
          // there will be no joi in IPFS (pun indended)
          _promise2.default.resolve().then(function () {
            return require('ipfs');
          }) // eslint-disable-line
          .then(function (Ipfs) {
            var ipfs = void 0;
            if (_this5.config.ipfs.instance) {
              ipfs = _this5.config.ipfs.instance;
            } else {
              ipfs = new Ipfs({
                bitswap: {
                  // maxMessageSize: 256 * 1024
                  maxMessageSize: _this5.config.ipfs['bitswap.maxMessageSize']
                },
                start: true,
                repo: config.ipfs.repo || '/tmp/test-repo-' + String(Math.random()),
                config: {
                  Addresses: {
                    Swarm: _this5.config.ipfs.swarm
                    // [
                    //   '/dns4/star.paratii.video/tcp/443/wss/p2p-webrtc-star',
                    //   '/dns4/ws.star.paratii.video/tcp/443/wss/p2p-websocket-star/'
                    // ]
                  },
                  Bootstrap: _this5.config.ipfs.bootstrap
                  // [
                  //   '/dns4/bootstrap.paratii.video/tcp/443/wss/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW'
                  // ]
                }
              });
            }

            _this5.ipfs = ipfs;

            ipfs.on('ready', function () {
              _this5.log('[IPFS] node Ready.');

              ipfs._bitswap.notifications.on('receivedNewBlock', function (peerId, block) {
                _this5.log('[IPFS] receivedNewBlock | peer: ', peerId.toB58String(), ' block length: ', block.data.length);
                _this5.log('---------[IPFS] bitswap LedgerMap ---------------------');
                ipfs._bitswap.engine.ledgerMap.forEach(function (ledger, peerId, ledgerMap) {
                  _this5.log(peerId + ' : ' + (0, _stringify2.default)(ledger.accounting) + '\n');
                });
                _this5.log('-------------------------------------------------------');
              });

              ipfs.id().then(function (id) {
                var peerInfo = id;
                _this5.id = id;
                _this5.log('[IPFS] id:  ' + peerInfo);

                _this5.initProtocol(ipfs);

                _this5.ipfs = ipfs;
                _this5.protocol.start(function () {
                  setTimeout(function () {
                    resolve(ipfs);
                  }, 10);
                });
              });
            });

            ipfs.on('error', function (err) {
              if (err) {
                // this.log('IPFS node ', ipfs)
                _this5.error('[IPFS] Error ', err);
                reject(err);
              }
            });
          });
        }
      });
    }
    /**
     * Checks if the IPFS local node is running
     * @return {Promise} that resolves in a boolean
     */

  }, {
    key: 'checkIPFSState',
    value: function checkIPFSState() {
      var _this6 = this;

      return _regenerator2.default.async(function checkIPFSState$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              return _context3.abrupt('return', new _promise2.default(function (resolve) {
                _this6.getIPFSInstance().then(function (ipfsInstance) {
                  if (ipfsInstance.state.state() === 'running') {
                    resolve(true);
                  } else {
                    resolve(false);
                  }
                }).catch(function (e) {
                  resolve(false);
                });
              }));

            case 1:
            case 'end':
              return _context3.stop();
          }
        }
      }, null, this);
    }
    /**
     * Checks if the IPFS local node is running and returns an object
     * @return {Promise} that resolves in an object
     */

  }, {
    key: 'serviceCheckIPFSState',
    value: function serviceCheckIPFSState() {
      var _this7 = this;

      return _regenerator2.default.async(function serviceCheckIPFSState$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              return _context4.abrupt('return', new _promise2.default(function (resolve) {
                var executionStart = new Date().getTime();

                _this7.getIPFSInstance().then(function (ipfsInstance) {
                  var currentState = ipfsInstance.state.state();
                  if (currentState === 'running') {
                    var executionEnd = new Date().getTime();
                    var executionTime = executionEnd - executionStart;

                    var ipfsInstanceCheckObject = {
                      provider: 'self',
                      responseTime: executionTime,
                      response: currentState,
                      responsive: true
                    };

                    resolve(ipfsInstanceCheckObject);
                  } else {
                    var _ipfsInstanceCheckObject = {
                      provider: 'self',
                      responseTime: 0,
                      response: currentState,
                      responsive: false
                    };
                    resolve(_ipfsInstanceCheckObject);
                  }
                }).catch(function (e) {
                  var ipfsInstanceCheckObject = {
                    provider: 'self',
                    responseTime: 0,
                    response: 'error',
                    responsive: false
                  };
                  resolve(ipfsInstanceCheckObject);
                });
              }));

            case 1:
            case 'end':
              return _context4.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'initProtocol',
    value: function initProtocol(ipfs) {
      var _this8 = this;

      var ptiAddress = this.config.account.address || 'no_address';
      this.protocol = new _paratiiProtocol2.default(ipfs._libp2pNode, ipfs._repo.blocks,
      // add ETH Address here.
      ptiAddress);

      this._node = ipfs;
      this.remote._node = ipfs;

      this.protocol.notifications.on('message:new', function (peerId, msg) {
        _this8.log('[paratii-protocol] ', peerId.toB58String(), ' new Msg: ', msg);
      });
      // emit all commands.
      // NOTE : this will be changed once protocol upgrades are ready.
      this.protocol.notifications.on('command', function (peerId, command) {
        _this8.emit('protocol:incoming', peerId, command);
      });
    }
  }]);
  return ParatiiIPFS;
}(_events.EventEmitter);