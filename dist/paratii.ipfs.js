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

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _paratiiProtocol = require('paratii-protocol');

var _paratiiProtocol2 = _interopRequireDefault(_paratiiProtocol);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

global.Buffer = global.Buffer || require('buffer').Buffer; // import { paratiiIPFS } from './ipfs/index.js'


var Ipfs = require('ipfs');
var dopts = require('default-options');
var Uploader = require('./paratii.ipfs.uploader.js');
// var pull = require('pull-stream')
// var pullFilereader = require('pull-filereader')

var ParatiiIPFS = exports.ParatiiIPFS = function () {
  function ParatiiIPFS(config) {
    (0, _classCallCheck3.default)(this, ParatiiIPFS);

    var defaults = {
      protocol: null,
      onReadyHook: [],
      'config.addresses.swarm': ['/dns4/star.paratii.video/tcp/443/wss/p2p-webrtc-star'],
      'ipfs.config.Bootstrap': ['/dns4/bootstrap.paratii.video/tcp/443/wss/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW'],
      'ipfs.repo': '/tmp/paratii-alpha-' + String(Math.random()), // key where to save information
      'ipfs.bitswap.maxMessageSize': 32 * 1024,
      'address': null, // 'Ethereum address'
      'verbose': false
    };
    this.config = dopts(config, defaults, { allowUnknown: true });

    this.uploader = new Uploader(this);
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
      var _this = this;

      return new _promise2.default(function (resolve, reject) {
        if (_this.ipfs) {
          resolve(_this.ipfs);
        } else {
          var config = _this.config;
          var ipfs = new Ipfs({
            bitswap: {
              maxMessageSize: config['ipfs.bitswap.maxMessageSize']
            },
            repo: config['repo'] || '/tmp/test-repo-' + String(Math.random()),
            config: {
              Addresses: {
                Swarm: config['ipfs.config.addresses.swarm']
              },
              Bootstrap: config['ipfs.config.Bootstrap']
            }
          });

          _this.ipfs = ipfs;

          ipfs.on('ready', function () {
            _this.log('[IPFS] node Ready.');

            ipfs._bitswap.notifications.on('receivedNewBlock', function (peerId, block) {
              _this.log('[IPFS] receivedNewBlock | peer: ', peerId.toB58String(), ' block length: ', block.data.length);
              _this.log('---------[IPFS] bitswap LedgerMap ---------------------');
              ipfs._bitswap.engine.ledgerMap.forEach(function (ledger, peerId, ledgerMap) {
                _this.log(peerId + ' : ' + (0, _stringify2.default)(ledger.accounting) + '\n');
              });
              _this.log('-------------------------------------------------------');
            });

            ipfs.id().then(function (id) {
              var peerInfo = id;
              _this.id = id;
              _this.log('[IPFS] id:  ' + peerInfo);
              var ptiAddress = _this.config.address || 'no_address';
              _this.protocol = new _paratiiProtocol2.default(ipfs._libp2pNode, ipfs._repo.blocks,
              // add ETH Address here.
              ptiAddress);

              // uploader
              _this.uploader.setOptions({
                node: ipfs,
                chunkSize: 64048
              });

              _this.protocol.notifications.on('message:new', function (peerId, msg) {
                _this.log('[paratii-protocol] ', peerId.toB58String(), ' new Msg: ', msg);
              });

              _this.ipfs = ipfs;

              resolve(ipfs);
            });
          });

          ipfs.on('error', function (err) {
            if (err) {
              // this.log('IPFS node ', ipfs)
              _this.error('[IPFS] Error ', err);
              reject(err);
            }
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
              return _regenerator2.default.awrap(ipfs.object.put(obj));

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
              return _context3.abrupt('return', node.toJSON().multihash);

            case 16:
            case 'end':
              return _context3.stop();
          }
        }
      }, null, this, [[5, 11]]);
    }
  }, {
    key: 'getJSON',
    value: function getJSON(multihash) {
      var ipfs, node;
      return _regenerator2.default.async(function getJSON$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return _regenerator2.default.awrap(this.getIPFSInstance());

            case 2:
              ipfs = _context4.sent;

              // if (!this.ipfs || !this.ipfs.isOnline()) {
              //   throw new Error('IPFS node is not ready, please trigger getIPFSInstance first')
              // }

              node = void 0;
              _context4.prev = 4;
              _context4.next = 7;
              return _regenerator2.default.awrap(ipfs.object.get(multihash));

            case 7:
              node = _context4.sent;
              _context4.next = 14;
              break;

            case 10:
              _context4.prev = 10;
              _context4.t0 = _context4['catch'](4);

              if (!_context4.t0) {
                _context4.next = 14;
                break;
              }

              throw _context4.t0;

            case 14:
              return _context4.abrupt('return', JSON.parse(node.toJSON().data));

            case 15:
            case 'end':
              return _context4.stop();
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
}();