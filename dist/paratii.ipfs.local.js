/* global File, ArrayBuffer */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiIPFSLocal = undefined;

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _setImmediate2 = require('babel-runtime/core-js/set-immediate');

var _setImmediate3 = _interopRequireDefault(_setImmediate2);

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

var _events = require('events');

var _paratiiProtocol = require('paratii-protocol');

var _paratiiProtocol2 = _interopRequireDefault(_paratiiProtocol);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var pull = require('pull-stream');
var pullFilereader = require('pull-filereader');
var toPull = require('stream-to-pull-stream');
var fs = require('fs');
var path = require('path');

var _require = require('async'),
    eachSeries = _require.eachSeries,
    nextTick = _require.nextTick;

var once = require('once');
// const Multiaddr = require('multiaddr')
// const Resumable = require('resumablejs')

/**
 * IPFS UPLOADER : Paratii IPFS uploader interface.
 * @extends EventEmitter
 * @param {ParatiiIPFSUploaderSchema} opts
 */

var ParatiiIPFSLocal = exports.ParatiiIPFSLocal = function (_EventEmitter) {
  (0, _inherits3.default)(ParatiiIPFSLocal, _EventEmitter);

  /**
  * @typedef {Array} ParatiiIPFSUploaderSchema
  * @property {?ipfsSchema} ipfs
  * @property {?Object} ParatiiIPFS
  */
  function ParatiiIPFSLocal(config) {
    (0, _classCallCheck3.default)(this, ParatiiIPFSLocal);

    // const schema = joi.object({
    //   ipfs: ipfsSchema,
    //   paratiiIPFS: joi.object().optional()
    // //   onReadyHook: joi.array().ordered().default([]),
    // //   protocol: joi.string().default(null),
    // })
    // const result = joi.validate(opts, schema, {allowUnknown: true})
    // if (result.error) throw result.error
    // this.config = result.value
    var _this = (0, _possibleConstructorReturn3.default)(this, (ParatiiIPFSLocal.__proto__ || (0, _getPrototypeOf2.default)(ParatiiIPFSLocal)).call(this));

    _this.config = config;
    _this._ipfs = _this.config.ipfsInstance;
    return _this;
  }
  // /**
  //  * Adds the file to ipfs
  //  * @param  {ReadStream}  fileStream ReadStream of the file. Can be created with fs.createReadStream(path)
  //  * @return {Promise}            data about the added file (path,multihash,size)
  //  * @example
  //  * let path = 'test/data/some-file.txt'
  //  * let fileStream = fs.createReadStream(path)
  //  * let result = await paratiiIPFS.add(fileStream)
  //  */
  // async add (fileStream) {
  //   let ipfs = await this.getIPFSInstance()
  //   return ipfs.files.add(fileStream)
  // }
  /**
   * uploads a single file to *local* IPFS node
   * @param {File} file HTML5 File Object.
   * @returns {EventEmitter} checkout the upload function below for details.
   * @example let uploaderEv = paratiiIPFS.uploader.add(files)
    */


  (0, _createClass3.default)(ParatiiIPFSLocal, [{
    key: 'add',
    value: function add(file) {
      var files = void 0;
      if (Array.isArray(file)) {
        files = file;
      } else {
        files = [file];
      }

      var result = [];

      for (var i = 0; i < files.length; i++) {
        // check if File is actually available or not.
        // if not it means we're not in the browser land.
        if (typeof File !== 'undefined') {
          if (files[i] instanceof File) {
            result.push(this.html5FileToPull(files[i]));
          } else {
            result.push(this.fsFileToPull(files[i]));
          }
        } else {
          result.push(this.fsFileToPull(files[i]));
        }
      }
      return this.upload(result);
    }

    /**
     * upload an Array of files as is to the local IPFS node
     * @param  {Array} files    HTML5 File Object Array.
     * @return {EventEmitter} returns EventEmitter with the following events:
     *    - 'start': uploader started.
     *    - 'progress': (chunkLength, progressPercent)
     *    - 'fileReady': (file) triggered when a file is uploaded locally.
     *    - 'done': (files) triggered when the uploader is done locally.
     *    - 'error': (err) triggered whenever an error occurs.
     * @example ?
      */

  }, {
    key: 'upload',
    value: function upload(files) {
      var _this2 = this;

      var meta = {}; // holds File metadata.
      var ev = new _events.EventEmitter();

      this.start().then(function () {
        // trigger onStart callback
        ev.emit('start');
        if (files && files[0] && files[0].size > _this2.config.ipfs.maxFileSize) {
          ev.emit('error', 'file size is larger than the allowed ' + _this2.config.ipfs.maxFileSize / 1024 / 1024 + 'MB');
          return;
        }

        pull(pull.values(files), pull.through(function (file) {
          _this2._ipfs.log('Adding ', file);
          meta.fileSize = file.size;
          meta.total = 0;
        }), pull.asyncMap(function (file, cb) {
          return pull(pull.values([{
            path: file.name,
            // content: pullFilereader(file)
            content: pull(file._pullStream, pull.through(function (chunk) {
              return ev.emit('progress2', chunk.length, Math.floor((meta.total += chunk.length) * 1.0 / meta.fileSize * 100));
            }))
          }]), _this2._node.files.addPullStream({ chunkerOptions: { maxChunkSize: _this2.config.ipfs.chunkSize } }), // default size 262144
          pull.collect(function (err, res) {
            if (err) {
              return ev.emit('error', err);
            }

            var hashedFile = res[0];
            _this2._ipfs.log('Adding %s finished as %s, size: %s', hashedFile.path, hashedFile.hash, hashedFile.size);

            if (file._html5File) {
              _this2.xhrUpload(file, hashedFile, ev);
            } else {
              ev.emit('fileReady', hashedFile);
            }

            cb(null, hashedFile);
          }));
        }), pull.collect(function (err, hashedFiles) {
          if (err) {
            ev.emit('error', err);
          }
          _this2._ipfs.log('uploader is DONE');
          ev.emit('done', hashedFiles);
        }));
      });

      return ev;
    }

    /**
     * upload an entire directory to IPFS
     * @param  {string}   dirPath path to directory
     * @return {Promise}           returns the {multihash, path, size} for the uploaded folder.
     * @example ?
     */

  }, {
    key: 'addDirectory',
    value: function addDirectory(dirPath) {
      var _this3 = this;

      return new _promise2.default(function (resolve, reject) {
        // cb = once(cb)
        var resp = null;
        // this._ipfs.log('adding ', dirPath, ' to IPFS')

        var addStream = _this3._node.files.addReadableStream();
        addStream.on('data', function (file) {
          // this._ipfs.log('dirPath ', dirPath)
          // this._ipfs.log('file Added ', file)
          if (file.path === dirPath) {
            // this._ipfs.log('this is the hash to return ')
            resp = file;
            nextTick(function () {
              return resolve(resp);
            });
          }
        });

        addStream.on('end', function () {
          // this._ipfs.log('addStream ended')
          // nextTick(() => cb(null, resp))
        });

        fs.readdir(dirPath, function (err, files) {
          if (err) return reject(err);
          eachSeries(files, function (file, next) {
            next = once(next);
            try {
              _this3._ipfs.log('reading file ', file);
              var rStream = fs.createReadStream(path.join(dirPath, file));
              rStream.on('error', function (err) {
                if (err) {
                  _this3._ipfs.error('rStream Error ', err);
                  return next();
                }
              });
              if (rStream) {
                addStream.write({
                  path: path.join(dirPath, file),
                  content: rStream
                });
              }
            } catch (e) {
              if (e) {
                _this3._ipfs.error('createReadStream Error: ', e);
              }
            } finally {}
            // next()
            nextTick(function () {
              return next();
            });
          }, function (err) {
            if (err) return reject(err);
            // addStream.destroy()
            addStream.end();
          });
        });
      });
    }
    /**
     * get file from ipfs
     * @param  {string}  hash ipfs multihash of the file
     * @return {Promise}      the file (path,content)
     * @example
     * let result = await paratiiIPFS.add(fileStream)
     * let hash = result[0].hash
     * let fileContent = await paratiiIPFS.get(hash)
     */

  }, {
    key: 'get',
    value: function get(hash) {
      var ipfs;
      return _regenerator2.default.async(function get$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _regenerator2.default.awrap(this.getIPFSInstance());

            case 2:
              ipfs = _context.sent;
              return _context.abrupt('return', ipfs.files.get(hash));

            case 4:
            case 'end':
              return _context.stop();
          }
        }
      }, null, this);
    }

    /**
    * gets a JSON object stored in IPFS
    * @param  {string}  multihash ipfs multihash of the object
    * @return {Promise}           requested Object
    * @example let jsonObj = await paratii.ipfs.getJSON('some-multihash')
    */

  }, {
    key: 'getJSON',
    value: function getJSON(multihash) {
      var ipfs, node;
      return _regenerator2.default.async(function getJSON$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return _regenerator2.default.awrap(this.getIPFSInstance());

            case 2:
              ipfs = _context2.sent;
              node = void 0;
              _context2.prev = 4;
              _context2.next = 7;
              return _regenerator2.default.awrap(ipfs.files.cat(multihash));

            case 7:
              node = _context2.sent;
              _context2.next = 14;
              break;

            case 10:
              _context2.prev = 10;
              _context2.t0 = _context2['catch'](4);

              if (!_context2.t0) {
                _context2.next = 14;
                break;
              }

              throw _context2.t0;

            case 14:
              return _context2.abrupt('return', JSON.parse(node.toString()));

            case 15:
            case 'end':
              return _context2.stop();
          }
        }
      }, null, this, [[4, 10]]);
    }

    /**
     * Starts the IPFS node
     * @return {Promise} that resolves in an IPFS instance
     * @example paratii.ipfs.start()
     */

  }, {
    key: 'start',
    value: function start() {
      var _this4 = this;

      return new _promise2.default(function (resolve, reject) {
        if (_this4.ipfs && _this4.ipfs.isOnline()) {
          console.log('IPFS is already running');
          return resolve(_this4.ipfs);
        }

        _this4.getIPFSInstance().then(function (ipfs) {
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
      var _this5 = this;

      return new _promise2.default(function (resolve, reject) {
        if (!_this5.ipfs || !_this5.ipfs.isOnline()) {
          resolve();
        }
        if (_this5.ipfs) {
          _this5.ipfs.stop(function () {
            (0, _setImmediate3.default)(function () {
              resolve();
            });
          });
        }
      });
    }

    /**
     * get an ipfs instance of jsipfs. Singleton pattern
     * @return {Object} Ipfs instance
     * @example ipfs = await paratii.ipfs.getIPFSInstance()
     */

  }, {
    key: 'getIPFSInstance',
    value: function getIPFSInstance() {
      var _this6 = this;

      return new _promise2.default(function (resolve, reject) {
        if (_this6.ipfs) {
          resolve(_this6.ipfs);
        } else {
          var config = _this6.config;
          // there will be no joi in IPFS (pun indended)
          _promise2.default.resolve().then(function () {
            return require('ipfs');
          }) // eslint-disable-line
          .then(function (Ipfs) {
            var ipfs = new Ipfs({
              bitswap: {
                // maxMessageSize: 256 * 1024
                maxMessageSize: _this6.config.ipfs['bitswap.maxMessageSize']
              },
              start: true,
              repo: config.ipfs.repo || '/tmp/test-repo-' + String(Math.random()),
              config: {
                Addresses: {
                  Swarm: _this6.config.ipfs.swarm
                  // [
                  //   '/dns4/star.paratii.video/tcp/443/wss/p2p-webrtc-star',
                  //   '/dns4/ws.star.paratii.video/tcp/443/wss/p2p-websocket-star/'
                  // ]
                },
                Bootstrap: _this6.config.ipfs.bootstrap
                // [
                //   '/dns4/bootstrap.paratii.video/tcp/443/wss/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW'
                // ]
              }
            });

            _this6.ipfs = ipfs;

            ipfs.on('ready', function () {
              _this6.log('[IPFS] node Ready.');

              ipfs._bitswap.notifications.on('receivedNewBlock', function (peerId, block) {
                _this6.log('[IPFS] receivedNewBlock | peer: ', peerId.toB58String(), ' block length: ', block.data.length);
                _this6.log('---------[IPFS] bitswap LedgerMap ---------------------');
                ipfs._bitswap.engine.ledgerMap.forEach(function (ledger, peerId, ledgerMap) {
                  _this6.log(peerId + ' : ' + (0, _stringify2.default)(ledger.accounting) + '\n');
                });
                _this6.log('-------------------------------------------------------');
              });

              ipfs.id().then(function (id) {
                var peerInfo = id;
                _this6.id = id;
                _this6.log('[IPFS] id:  ' + peerInfo);
                var ptiAddress = _this6.config.paratii && _this6.config.paratii.eth.getAccount() || 'no_address';
                _this6.protocol = new _paratiiProtocol2.default(ipfs._libp2pNode, ipfs._repo.blocks,
                // add ETH Address here.
                ptiAddress);

                _this6._ipfs.remote._node = ipfs;
                _this6._ipfs.local._node = ipfs;
                _this6._ipfs.transcoder._node = ipfs;

                _this6.protocol.notifications.on('message:new', function (peerId, msg) {
                  _this6.log('[paratii-protocol] ', peerId.toB58String(), ' new Msg: ', msg);
                });
                // emit all commands.
                // NOTE : this will be changed once protocol upgrades are ready.
                _this6.protocol.notifications.on('command', function (peerId, command) {
                  _this6.emit('protocol:incoming', peerId, command);
                });

                _this6.ipfs = ipfs;
                _this6.protocol.start(function () {
                  setTimeout(function () {
                    resolve(ipfs);
                  }, 10);
                });
              });
            });

            ipfs.on('error', function (err) {
              if (err) {
                // this.log('IPFS node ', ipfs)
                _this6.error('[IPFS] Error ', err);
                reject(err);
              }
            });
          });
        }
      });
    }
    /**
     * adds a data Object to the IPFS local instance
     * @param  {Object}  data JSON object to store
     * @return {Promise}      promise with the ipfs multihash
     * @example let result = await paratiiIPFS.addJSON(data)
     */

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
     * returns a generic File Object with a Pull Stream from an HTML5 File
     * @param  {File} file  HTML5 File Object
     * @return {Object}      generic file object.
     * @example ?
      */

  }, {
    key: 'html5FileToPull',
    value: function html5FileToPull(file) {
      return {
        name: file.name,
        size: file.size,
        path: file.path,
        _html5File: file,
        _pullStream: pullFilereader(file)
      };
    }

    /**
     * returns a generic file Object from a file path
     * @param  {string} filePath Path to file.
     * @return {Object} generic file object.
     * @example ?
      */

  }, {
    key: 'fsFileToPull',
    value: function fsFileToPull(filePath) {
      var stats = fs.statSync(filePath);
      if (stats) {
        return {
          name: path.basename(filePath),
          size: stats.size,
          _pullStream: toPull(fs.createReadStream(filePath))
        };
      } else {
        return null;
      }
    }

    /**
     * log messages on the console if verbose is set
     * @param  {string} msg text to log
     * @example
     * paratii.ipfs.log("some-text")
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
    */

  }, {
    key: 'error',
    value: function error() {
      if (this.config.verbose) {
        var _console3;

        (_console3 = console).error.apply(_console3, arguments);
      }
    }
  }]);
  return ParatiiIPFSLocal;
}(_events.EventEmitter);