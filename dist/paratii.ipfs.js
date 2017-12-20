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

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

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

    this.config = config;

    var defaults = {
      protocol: null,
      onReadyHook: [],
      'config.addresses.swarm': ['/dns4/star.paratii.video/wss/p2p-webrtc-star'],
      'config.Bootstrap': ['/dns4/bootstrap.paratii.video/tcp/443/wss/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW'],
      'repo': '/tmp/paratii-alpha-' + String(Math.random()), // key where to save information
      'bitswap.maxMessageSize': 32 * 1024,
      'address': null, // 'Ethereum address'
      'verbose': false
    };
    var options = dopts(config, defaults, { allowUnknown: true });
    (0, _assign2.default)(this.config, options);

    this.uploader = new Uploader(this);
  }

  (0, _createClass3.default)(ParatiiIPFS, [{
    key: 'log',
    value: function log(msg) {
      if (this.config.verbose) {
        console.log(msg);
      }
    }
  }, {
    key: 'warn',
    value: function warn(msg) {
      if (this.config.verbose) {
        console.warn(msg);
      }
    }
  }, {
    key: 'error',
    value: function error(msg) {
      if (this.config.verbose) {
        console.error(msg);
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
          _this.ipfs = new Ipfs({
            bitswap: {
              maxMessageSize: config['bitswap.maxMessageSize']
            },
            repo: config.repo,
            config: {
              Addresses: {
                Swarm: config['config.addresses.swarm']
              },
              Bootstrap: config['config.Bootstrap']
            }
          });

          var ipfs = _this.ipfs;

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
              _this.log('[IPFS] id: ', peerInfo);
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

              // setTimeout(() => {
              //   this.protocol.start(noop)
              //   this.triggerOnReady()
              // }, 10)

              _this.ipfs = ipfs;

              resolve(ipfs);

              // setImmediate(() => {
              //
              // })
              // callback()
            });
            // resolve(ipfs)
          });

          ipfs.on('error', function (err) {
            if (err) {
              _this.log('IPFS node ', ipfs);
              _this.error('[IPFS] ', err);
              reject(err);
            }
          });
        }
      });
    }

    // TODO: return a promise

  }, {
    key: 'start',
    value: function start(callback) {
      // if (!window.Ipfs) {
      //   return callback(new Error('window.Ipfs is not available, call initIPFS first'))
      // }

      if (this.ipfs && this.ipfs.isOnline()) {
        return callback();
      }

      this.getIPFSInstance().then(function (ipfs) {
        ipfs.start(callback);
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