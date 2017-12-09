'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiIPFS = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // import { paratiiIPFS } from './ipfs/index.js'


var _paratiiProtocol = require('paratii-protocol');

var _paratiiProtocol2 = _interopRequireDefault(_paratiiProtocol);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var pull = require('pull-stream');
var pullFilereader = require('pull-filereader');

var Ipfs = require('ipfs');
var dopts = require('default-options');

var ParatiiIPFS = exports.ParatiiIPFS = function () {
  function ParatiiIPFS(config) {
    _classCallCheck(this, ParatiiIPFS);

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
    Object.assign(this.config, options);
  }

  _createClass(ParatiiIPFS, [{
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

      return new Promise(function (resolve, reject) {
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
                _this.log(peerId + ' : ' + JSON.stringify(ledger.accounting) + '\n');
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

              _this.protocol.notifications.on('message:new', function (peerId, msg) {
                _this.log('[paratii-protocol] ', peerId.toB58String(), ' new Msg: ', msg);
              });

              // setTimeout(() => {
              //   this.protocol.start(noop)
              //   this.triggerOnReady()
              // }, 10)

              _this.ipfs = ipfs;
              resolve(ipfs);
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

      this.ipfs.start(callback);
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
        return this.ipfs.stop(callback);
      }
    }
  }, {
    key: 'uploadFiles',
    value: function uploadFiles(files) {
      var _this2 = this;

      var fileSize, total, updateProgress;
      return regeneratorRuntime.async(function uploadFiles$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              updateProgress = function updateProgress(chunkLength) {
                total += chunkLength;
                this.log('Progress \t', total, ' / ', fileSize, ' = ', Math.floor(total / fileSize * 100));
              };

              fileSize = 0;
              _context.next = 4;
              return regeneratorRuntime.awrap(this.getIPFSInstance());

            case 4:
              total = 0;

              this.start(function () {
                // replace this by a callback?
                // setInterval(() => {
                //   this.ipfs._bitswap.engine.ledgerMap.forEach((ledger, peerId, ledgerMap) => {
                //     this.log(`${peerId} : ${JSON.stringify(ledger.accounting)}\n`)
                //   })
                // }, 5000)

                pull(pull.values(files), pull.through(function (file) {
                  _this2.log('Adding ', file);
                  fileSize = file.size;
                  total = 0;
                }), pull.asyncMap(function (file, cb) {
                  return pull(pull.values([{
                    path: file.name,
                    // content: pullFilereader(file)
                    content: pull(pullFilereader(file), pull.through(function (chunk) {
                      return updateProgress(chunk.length);
                    }))
                  }]), _this2.ipfs.files.createAddPullStream({ chunkerOptions: { maxChunkSize: 64048 } }), // default size 262144
                  pull.collect(function (err, res) {
                    if (err) {
                      return cb(err);
                    }
                    var file = res[0];
                    _this2.log('Adding %s finished', file.path);

                    // statusEl.innerHTML += `Added ${file.path} as ${file.hash} ` + '<br>'
                    // Trigger paratii transcoder signal

                    var msg = _this2.protocol.createCommand('transcode', { hash: file.hash, author: _this2.id.id });
                    _this2.ipfs.swarm.connect('/dns4/bootstrap.paratii.video/tcp/443/wss/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW', function (err, success) {
                      if (err) throw err;
                      _this2.ipfs.swarm.peers(function (err, peers) {
                        _this2.log('peers: ', peers);
                        if (err) throw err;
                        peers.map(function (peer) {
                          _this2.log('sending transcode msg to ', peer.peer.id.toB58String());
                          _this2.protocol.network.sendMessage(peer.peer.id, msg, function (err) {
                            if (err) _this2.warn('[Paratii-protocol] Error ', err);
                          });

                          if (peer.addr) {}
                        });
                        cb(null, file);
                      });
                    });
                  }));
                }), pull.collect(function (err, files) {
                  if (err) {
                    throw err;
                  }
                  // if (files && files.length) {
                  //   statusEl.innerHTML += `All Done!\n`
                  //   statusEl.innerHTML += `Don't Close this window. signaling transcoder...\n`
                  // }
                }));

                // paratii transcoder signal.
                _this2.protocol.notifications.on('command', function (peerId, command) {
                  _this2.log('paratii protocol: Got Command ', command);
                  if (command.payload.toString() === 'transcoding:done') {
                    var args = JSON.parse(command.args.toString());
                    var result = JSON.parse(args.result);
                    _this2.log('args: ', args);
                    _this2.log('result: ', result);
                    // statusEl.innerHTML += `Video HLS link: /ipfs/${result.master.hash}\n`

                    // titleEl = document.querySelector('#input-title')
                    // this.log('titleEl: ', titleEl)
                    //   Meteor.call('videos.create', {
                    //     id: String(Math.random()).split('.')[1],
                    //     title: titleEl.value,
                    //     price: 0.0,
                    //     src: '/ipfs/' + result.master.hash,
                    //     mimetype: 'video/mp4',
                    //     stats: {
                    //       likes: 0,
                    //       dislikes: 0
                    //     }}, (err, videoId) => {
                    //       if (err) throw err
                    //       this.log('[upload] Video Uploaded: ', videoId)
                    //       statusEl.innerHTML += '\n Video Uploaded go to <b><a href="/play/' + videoId + '">/play/' + videoId + '</a></b>\n'
                    //     })
                  }
                });
              });

            case 6:
            case 'end':
              return _context.stop();
          }
        }
      }, null, this);
    }
  }]);

  return ParatiiIPFS;
}();