'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiIPFS = undefined;

var _setImmediate2 = require('babel-runtime/core-js/set-immediate');

var _setImmediate3 = _interopRequireDefault(_setImmediate2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

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

var _paratiiProtocol = require('paratii-protocol');

var _paratiiProtocol2 = _interopRequireDefault(_paratiiProtocol);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

global.Buffer = global.Buffer || require('buffer').Buffer;

var joi = require('joi');
var Uploader = require('./paratii.ipfs.uploader.js');

var _require = require('events'),
    EventEmitter = _require.EventEmitter;
// const DEFAULT_REPO = '/tmp/paratii-ipfs-repo'

var ParatiiIPFS = exports.ParatiiIPFS = function (_EventEmitter) {
  (0, _inherits3.default)(ParatiiIPFS, _EventEmitter);

  function ParatiiIPFS(config) {
    (0, _classCallCheck3.default)(this, ParatiiIPFS);

    var _this = (0, _possibleConstructorReturn3.default)(this, (ParatiiIPFS.__proto__ || (0, _getPrototypeOf2.default)(ParatiiIPFS)).call(this));

    var schema = joi.object({
      protocol: joi.string().default(null),
      onReadyHook: joi.array().ordered().default([]),
      'config.addresses.swarm': joi.array().ordered(joi.string().default('/dns4/star.paratii.video/tcp/443/wss/p2p-webrtc-star'), joi.string().default('/dns/ws.star.paratii.video/wss/p2p-websocket-star/')),
      'ipfs.config.Bootstrap': joi.array().ordered(joi.string().default('/dns4/bootstrap.paratii.video/tcp/443/wss/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW')),
      'ipfs.bitswap.maxMessageSize': joi.number().default(128 * 1024),
      address: joi.string().default(null),
      verbose: joi.bool().default(false)
    }).unknown();

    var result = joi.validate(config, schema);
    var error = result.error;
    if (error) throw error;
    _this.config = result.value;
    _this.uploader = new Uploader(_this);
    return _this;
  }

  (0, _createClass3.default)(ParatiiIPFS, [{
    key: 'add',
    value: function add(fileStream) {
      var ipfs;
      return _regenerator2.default.async(function add$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _regenerator2.default.awrap(this.getIPFSInstance());

            case 2:
              ipfs = _context.sent;
              return _context.abrupt('return', ipfs.files.add(fileStream));

            case 4:
            case 'end':
              return _context.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'get',
    value: function get(hash) {
      var ipfs;
      return _regenerator2.default.async(function get$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return _regenerator2.default.awrap(this.getIPFSInstance());

            case 2:
              ipfs = _context2.sent;
              return _context2.abrupt('return', ipfs.files.get(hash));

            case 4:
            case 'end':
              return _context2.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'log',
    value: function log() {
      if (this.config.verbose) {
        var _console;

        (_console = console).log.apply(_console, arguments);
      }
    }
  }, {
    key: 'warn',
    value: function warn() {
      if (this.config.verbose) {
        var _console2;

        (_console2 = console).warn.apply(_console2, arguments);
      }
    }
  }, {
    key: 'error',
    value: function error() {
      if (this.config.verbose) {
        var _console3;

        (_console3 = console).error.apply(_console3, arguments);
      }
    }
  }, {
    key: 'getIPFSInstance',
    value: function getIPFSInstance() {
      var _this2 = this;

      return new _promise2.default(function (resolve, reject) {
        if (_this2.ipfs) {
          resolve(_this2.ipfs);
        } else {
          var config = _this2.config;
          // there will be no joi in IPFS (pun indended)
          _promise2.default.resolve().then(function () {
            return require('ipfs');
          }) // eslint-disable-line
          .then(function (Ipfs) {
            var ipfs = new Ipfs({
              bitswap: {
                maxMessageSize: 256 * 1024
              },
              start: true,
              repo: config.ipfs.repo || '/tmp/test-repo-' + String(Math.random()),
              config: {
                Addresses: {
                  Swarm: ['/dns4/star.paratii.video/tcp/443/wss/p2p-webrtc-star', '/dns4/ws.star.paratii.video/tcp/443/wss/p2p-websocket-star/']
                },
                Bootstrap: ['/dns4/bootstrap.paratii.video/tcp/443/wss/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW']
              }
            });

            _this2.ipfs = ipfs;

            ipfs.on('ready', function () {
              _this2.log('[IPFS] node Ready.');

              ipfs._bitswap.notifications.on('receivedNewBlock', function (peerId, block) {
                _this2.log('[IPFS] receivedNewBlock | peer: ', peerId.toB58String(), ' block length: ', block.data.length);
                _this2.log('---------[IPFS] bitswap LedgerMap ---------------------');
                ipfs._bitswap.engine.ledgerMap.forEach(function (ledger, peerId, ledgerMap) {
                  _this2.log(peerId + ' : ' + (0, _stringify2.default)(ledger.accounting) + '\n');
                });
                _this2.log('-------------------------------------------------------');
              });

              ipfs.id().then(function (id) {
                var peerInfo = id;
                _this2.id = id;
                _this2.log('[IPFS] id:  ' + peerInfo);
                var ptiAddress = _this2.config.address || 'no_address';
                _this2.protocol = new _paratiiProtocol2.default(ipfs._libp2pNode, ipfs._repo.blocks,
                // add ETH Address here.
                ptiAddress);

                // uploader
                _this2.uploader.setOptions({
                  node: ipfs,
                  chunkSize: 128 * 1024
                });

                _this2.protocol.notifications.on('message:new', function (peerId, msg) {
                  _this2.log('[paratii-protocol] ', peerId.toB58String(), ' new Msg: ', msg);
                });
                // emit all commands.
                // NOTE : this will be changed once protocol upgrades are ready.
                _this2.protocol.notifications.on('command', function (peerId, command) {
                  _this2.emit('protocol:incoming', peerId, command);
                });

                _this2.ipfs = ipfs;
                _this2.protocol.start(function () {
                  setTimeout(function () {
                    resolve(ipfs);
                  }, 10);
                });
              });
            });

            ipfs.on('error', function (err) {
              if (err) {
                // this.log('IPFS node ', ipfs)
                _this2.error('[IPFS] Error ', err);
                reject(err);
              }
            });
          });
        }
      });
    }
  }, {
    key: 'addJSON',
    value: function addJSON(data) {
      var ipfs, obj, node;
      return _regenerator2.default.async(function addJSON$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return _regenerator2.default.awrap(this.getIPFSInstance());

            case 2:
              ipfs = _context3.sent;

              // if (!this.ipfs || !this.ipfs.isOnline()) {
              //   throw new Error('IPFS node is not ready, please trigger getIPFSInstance first')
              // }
              obj = {
                Data: Buffer.from((0, _stringify2.default)(data)),
                Links: []
              };
              node = void 0;
              _context3.prev = 5;
              _context3.next = 8;
              return _regenerator2.default.awrap(ipfs.files.add(obj.Data));

            case 8:
              node = _context3.sent;
              _context3.next = 15;
              break;

            case 11:
              _context3.prev = 11;
              _context3.t0 = _context3['catch'](5);

              if (!_context3.t0) {
                _context3.next = 15;
                break;
              }

              throw _context3.t0;

            case 15:
              return _context3.abrupt('return', node[0].hash);

            case 16:
            case 'end':
              return _context3.stop();
          }
        }
      }, null, this, [[5, 11]]);
    }

    /**
     * convenient method to add JSON and send it for persistance storage.
     * @param  {object}  data JSON object to store
     * @return {string}      returns multihash of the stored object.
     */

  }, {
    key: 'addAndPinJSON',
    value: function addAndPinJSON(data) {
      var _this3 = this;

      var hash, pinFile, pinEv;
      return _regenerator2.default.async(function addAndPinJSON$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return _regenerator2.default.awrap(this.addJSON(data));

            case 2:
              hash = _context4.sent;

              pinFile = function pinFile() {
                var pinEv = _this3.uploader.pinFile(hash, { author: _this3.config.account.address });
                pinEv.on('pin:error', function (err) {
                  console.warn('pin:error:', hash, ' : ', err);
                  pinEv.removeAllListeners();
                });
                pinEv.on('pin:done', function (hash) {
                  _this3.log('pin:done:', hash);
                  pinEv.removeAllListeners();
                });
                return pinEv;
              };

              pinEv = pinFile();


              pinEv.on('pin:error', function (err) {
                console.warn('pin:error:', hash, ' : ', err);
                console.log('trying again');
                pinEv = pinFile();
              });

              return _context4.abrupt('return', hash);

            case 7:
            case 'end':
              return _context4.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'getJSON',
    value: function getJSON(multihash) {
      var ipfs, node;
      return _regenerator2.default.async(function getJSON$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return _regenerator2.default.awrap(this.getIPFSInstance());

            case 2:
              ipfs = _context5.sent;

              // if (!this.ipfs || !this.ipfs.isOnline()) {
              //   throw new Error('IPFS node is not ready, please trigger getIPFSInstance first')
              // }

              node = void 0;
              _context5.prev = 4;
              _context5.next = 7;
              return _regenerator2.default.awrap(ipfs.files.cat(multihash));

            case 7:
              node = _context5.sent;
              _context5.next = 14;
              break;

            case 10:
              _context5.prev = 10;
              _context5.t0 = _context5['catch'](4);

              if (!_context5.t0) {
                _context5.next = 14;
                break;
              }

              throw _context5.t0;

            case 14:
              return _context5.abrupt('return', JSON.parse(node.toString()));

            case 15:
            case 'end':
              return _context5.stop();
          }
        }
      }, null, this, [[4, 10]]);
    }

    // TODO: return a promise

  }, {
    key: 'start',
    value: function start(callback) {
      // if (!window.Ipfs) {
      //   return callback(new Error('window.Ipfs is not available, call initIPFS first'))
      // }

      if (this.ipfs && this.ipfs.isOnline()) {
        console.log('IPFS is already running');
        return callback();
      }

      this.getIPFSInstance().then(function (ipfs) {
        callback();
      });
    }
  }, {
    key: 'stop',
    value: function stop(callback) {
      if (!this.ipfs || !this.ipfs.isOnline()) {
        if (callback) {
          return callback();
        }
      }
      if (this.ipfs) {
        this.ipfs.stop(function () {
          (0, _setImmediate3.default)(function () {
            callback();
          });
        });
      }
    }
  }]);
  return ParatiiIPFS;
}(EventEmitter);