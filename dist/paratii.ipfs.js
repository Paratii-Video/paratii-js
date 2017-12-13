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

var Ipfs = require('ipfs');
var dopts = require('default-options');
var Uploader = require('./paratii.ipfs.uploader.js');
var pull = require('pull-stream');
var pullFilereader = require('pull-filereader');

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
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        if (_this2.ipfs) {
          resolve(_this2.ipfs);
        } else {
          var config = _this2.config;
          _this2.ipfs = new Ipfs({
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

          var ipfs = _this2.ipfs;

          ipfs.on('ready', function () {
            _this2.log('[IPFS] node Ready.');

            ipfs._bitswap.notifications.on('receivedNewBlock', function (peerId, block) {
              _this2.log('[IPFS] receivedNewBlock | peer: ', peerId.toB58String(), ' block length: ', block.data.length);
              _this2.log('---------[IPFS] bitswap LedgerMap ---------------------');
              ipfs._bitswap.engine.ledgerMap.forEach(function (ledger, peerId, ledgerMap) {
                _this2.log(peerId + ' : ' + JSON.stringify(ledger.accounting) + '\n');
              });
              _this2.log('-------------------------------------------------------');
            });

            ipfs.id().then(function (id) {
              var peerInfo = id;
              _this2.id = id;
              _this2.log('[IPFS] id: ', peerInfo);
              var ptiAddress = _this2.config.address || 'no_address';
              _this2.protocol = new _paratiiProtocol2.default(ipfs._libp2pNode, ipfs._repo.blocks,
              // add ETH Address here.
              ptiAddress);

              // uploader
              _this2.uploader = new Uploader(_this2, {
                node: ipfs,
                chunkSize: 64048
              });

              _this2.protocol.notifications.on('message:new', function (peerId, msg) {
                _this2.log('[paratii-protocol] ', peerId.toB58String(), ' new Msg: ', msg);
              });

              // setTimeout(() => {
              //   this.protocol.start(noop)
              //   this.triggerOnReady()
              // }, 10)

              _this2.ipfs = ipfs;

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
              _this2.log('IPFS node ', ipfs);
              _this2.error('[IPFS] ', err);
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
    value: function uploadFiles(files, options) {
      var _this3 = this;

      var _this, defaults, fileSize, total;

      return regeneratorRuntime.async(function uploadFiles$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              // TODO return proper promsie with status updates
              _this = this;
              defaults = {
                onStart: function onStart() {
                  _this.log('Upload started');
                  // setInterval(() => {
                  //   this.ipfs._bitswap.engine.ledgerMap.forEach((ledger, peerId, ledgerMap) => {
                  //     this.log(`${peerId} : ${JSON.stringify(ledger.accounting)}\n`)
                  //   })
                  // }, 5000)
                },
                onProgress: function onProgress(chunkLength) {
                  total += chunkLength;
                  this.log('Progress \t', total, ' / ', fileSize, ' = ', Math.floor(total / fileSize * 100));
                },
                onDone: function onDone(file) {
                  this.log('Adding %s finished', file.path);
                  // statusEl.innerHTML += `Added ${file.path} as ${file.hash} ` + '<br>'
                  // Trigger paratii transcoder signal
                  this.transcode({ hash: file.hash, author: this.id.id });
                },
                onFileReady: Function // function(file)
              };

              options = dopts(options, defaults);

              fileSize = 0;
              _context.next = 6;
              return regeneratorRuntime.awrap(this.getIPFSInstance());

            case 6:
              total = 0;

              this.start(function () {
                // set this by passing onSTart
                options.onStart();

                pull(pull.values(files), pull.through(function (file) {
                  _this3.log('Adding ', file);
                  fileSize = file.size;
                  total = 0;
                }), pull.asyncMap(function (file, cb) {
                  return pull(pull.values([{
                    path: file.name,
                    // content: pullFilereader(file)
                    content: pull(pullFilereader(file), pull.through(function (chunk) {
                      return options.onProgress(chunk.length);
                    }))
                  }]), _this3.ipfs.files.createAddPullStream({ chunkerOptions: { maxChunkSize: 64048 } }), // default size 262144
                  pull.collect(function (err, res) {
                    if (err) {
                      return cb(err);
                    }
                    var file = res[0];
                    options.onDone(file);
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
              });

            case 8:
            case 'end':
              return _context.stop();
          }
        }
      }, null, this);
    }

    // async transcode (options) {
    //   // TODO: return a promise
    //   // sends a message to the transcoding server to start transcoding the file with the given hash
    //   let defaults = {
    //     hash: String,
    //     author: String,
    //     onError: function (err) {
    //       if (err) this.warn('[Paratii-protocol] Error ', err)
    //     },
    //     onDone: function (args, result) {
    //       //
    //       this.log('args: ', args)
    //       this.log('result: ', result)
    //       // statusEl.innerHTML += `Video HLS link: /ipfs/${result.master.hash}\n`
    //       // titleEl = document.querySelector('#input-title')
    //       // this.log('titleEl: ', titleEl)
    //     //   Meteor.call('videos.create', {
    //     //     id: String(Math.random()).split('.')[1],
    //     //     title: titleEl.value,
    //     //     price: 0.0,
    //     //     src: '/ipfs/' + result.master.hash,
    //     //     mimetype: 'video/mp4',
    //     //     stats: {
    //     //       likes: 0,
    //     //       dislikes: 0
    //     //     }}, (err, videoId) => {
    //     //       if (err) throw err
    //     //       this.log('[upload] Video Uploaded: ', videoId)
    //     //       statusEl.innerHTML += '\n Video Uploaded go to <b><a href="/play/' + videoId + '">/play/' + videoId + '</a></b>\n'
    //     //     })
    //     }
    //   }
    //   options = dopts(options, defaults)
    //   let msg = this.protocol.createCommand('transcode', {hash: options.hash, author: options.author})
    //   this.ipfs.swarm.connect('/dns4/bootstrap.paratii.video/tcp/443/wss/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW', (err, success) => {
    //     if (err) throw err
    //     this.ipfs.swarm.peers((err, peers) => {
    //       this.log('peers: ', peers)
    //       if (err) throw err
    //       peers.map((peer) => {
    //         this.log('sending transcode msg to ', peer.peer.id.toB58String())
    //         this.protocol.network.sendMessage(peer.peer.id, msg, options.onError)
    //         if (peer.addr) {
    //         }
    //       })
    //     })
    //   })
    //
    //   // wait for paratii transcoder signal.
    //   this.protocol.notifications.on('command', (peerId, command) => {
    //     this.log('paratii protocol: Got Command ', command)
    //     if (command.payload.toString() === 'transcoding:done') {
    //       let args = JSON.parse(command.args.toString())
    //       let result = JSON.parse(args.result)
    //       options.onDone(args, result)
    //     }
    //   })
    // }

  }]);

  return ParatiiIPFS;
}();