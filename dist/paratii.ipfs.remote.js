/* global ArrayBuffer */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiIPFSRemote = undefined;

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

var _schemas = require('./schemas.js');

var _events = require('events');

var _joi = require('joi');

var _joi2 = _interopRequireDefault(_joi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Resumable = require('resumablejs');
var Multiaddr = require('multiaddr');
// const once = require('once')

// Needed to check the transcoder drop url status code
require('es6-promise').polyfill();
var fetch = require('isomorphic-fetch');
// Needed to open a socket connection
var net = require('net');

/**
 * Contains functions to interact with the remote IPFS node
 * @extends EventEmitter
 * @param {ParatiiIPFSRemoteSchema} opts
 */

var ParatiiIPFSRemote = exports.ParatiiIPFSRemote = function (_EventEmitter) {
  (0, _inherits3.default)(ParatiiIPFSRemote, _EventEmitter);

  /**
  * @typedef {Array} ParatiiIPFSRemoteSchema
  * @property {ipfsSchema=} ipfs
  * @property {ParatiiIPFS} paratiiIPFS
  */
  function ParatiiIPFSRemote(opts) {
    (0, _classCallCheck3.default)(this, ParatiiIPFSRemote);

    var _this = (0, _possibleConstructorReturn3.default)(this, (ParatiiIPFSRemote.__proto__ || (0, _getPrototypeOf2.default)(ParatiiIPFSRemote)).call(this));

    var schema = _joi2.default.object({
      ipfs: _schemas.ipfsSchema,
      paratiiIPFS: _joi2.default.object().optional()
      //   onReadyHook: joi.array().ordered().default([]),
      //   protocol: joi.string().default(null),
    });
    var result = _joi2.default.validate(opts, schema, { allowUnknown: true });
    if (result.error) throw result.error;
    _this.config = result.value;
    _this._ipfs = _this.config.paratiiIPFS; // this is the paratii.ipfs.js

    _this._rFiles = {};
    return _this;
  }

  /*
   * Add a file to the local ipfs node and upload it over xhr to the remote node
   */


  (0, _createClass3.default)(ParatiiIPFSRemote, [{
    key: 'addAndUpload',
    value: function addAndUpload(files, ev) {
      if (!ev) {
        ev = new _events.EventEmitter();
      }
      ev = this._ipfs.local.upload(files, ev);
      ev.on('local:fileReady', function (file, hashedFile) {
        if (file._html5File) {
          console.log('using xhrUpload .....');
          this._ipfs.remote.xhrUpload(file, hashedFile, ev);
        } else {
          this._ipfs.remote.pinFile(hashedFile);
        }
      });
      return ev;
    }

    /**
      * Upload a file over XHR to the transcoder. To be called with an event emitter as the last argument
      * @param  {Object} file file to upload
      * @param  {string} hash IPFS multi-hash of the file
      * @param  {?EventEmitter} ev optional event emitter
      * @example this.xhrUpload(file, hashedFile)
      */

  }, {
    key: 'xhrUpload',
    value: function xhrUpload(file, hashedFile, ev) {
      var _this2 = this;

      if (!ev) {
        ev = new _events.EventEmitter();
      }

      this._rFiles[hashedFile] = new Resumable({
        target: this.config.ipfs.transcoderDropUrl + '/' + hashedFile.hash,
        chunkSize: this.config.ipfs.xhrChunkSize,
        simultaneousUploads: 4,
        testChunks: false,
        throttleProgressCallbacks: 1,
        maxFileSize: this.config.ipfs.maxFileSize
      });

      this._rFiles[hashedFile].on('fileProgress', function (file) {
        ev.emit('progress', _this2._rFiles[hashedFile].progress() * 100);
      });

      this._rFiles[hashedFile].on('complete', function () {
        ev.emit('fileReady', hashedFile);
      });

      this._rFiles[hashedFile].on('error', function (err, file) {
        console.error('file ', file, 'err ', err);
      });

      this._rFiles[hashedFile].on('cancel', function () {
        console.log('file ' + hashedFile + ' upload was canceled');
        ev.emit('cancel', hashedFile);
      });

      this._rFiles[hashedFile].addFile(file._html5File);

      setTimeout(function () {
        _this2._rFiles[hashedFile].upload();
      }, 1);
    }

    /**
     * cancels an XHR upload
     * @param  {string} hash IPFS hash of the video to stop
     */

  }, {
    key: 'cancel',
    value: function cancel(hash) {
      var _this3 = this;

      if (this._rFiles[hash]) {
        this._rFiles.cancel();
        setTimeout(function () {
          delete _this3._rFiles[hash];
        }, 1);
      } else {
        console.log('file ' + hash + ' isn\'t currently uploading');
      }
    }

    // TODO add getMetadata doc
    /**
     * [getMetaData description]
     * @param  {Object} fileHash ipfs multihash of the file
     * @param  {?Object} options  can contain transcoder, transcoder id and an event emitter
     * @return {Object}          [description]
     * @private
     */

  }, {
    key: 'getMetaData',
    value: function getMetaData(fileHash, options) {
      var _this4 = this;

      return new _promise2.default(function (resolve, reject) {
        var schema = _joi2.default.object({
          transcoder: _joi2.default.string().default(_this4.config.ipfs.defaultTranscoder),
          transcoderId: _joi2.default.any().default(Multiaddr(_this4.config.ipfs.defaultTranscoder).getPeerId())
        }).unknown();

        _this4._ipfs.log('Signaling transcoder getMetaData...');
        var result = _joi2.default.validate(options, schema);
        var error = result.error;
        if (error) reject(error);
        var opts = result.value;
        var ev = void 0;
        if (opts.ev) {
          ev = opts.ev;
        } else {
          ev = new _events.EventEmitter();
        }
        _this4._ipfs.start().then(function () {
          var msg = _this4._ipfs.protocol.createCommand('getMetaData', { hash: fileHash });
          // FIXME : This is for dev, so we just signal our transcoder node.
          // This needs to be dynamic later on.
          _this4._ipfs.ipfs.swarm.connect(opts.transcoder, function (err, success) {
            if (err) return reject(err);

            opts.transcoderId = opts.transcoderId || Multiaddr(opts.transcoder).getPeerId();
            _this4._ipfs.log('transcoderId: ', opts.transcoderId);
            _this4._node.swarm.peers(function (err, peers) {
              _this4._ipfs.log('peers: ', peers);
              if (err) return reject(err);

              peers.map(function (peer) {
                _this4._ipfs.log('peerID : ', peer.peer.id.toB58String(), opts.transcoderId, peer.peer.id.toB58String() === opts.transcoder);
                if (peer.peer.id.toB58String() === opts.transcoderId) {
                  _this4._ipfs.log('sending getMetaData msg to ' + peer.peer.id.toB58String() + ' with request to transcode ' + fileHash);
                  _this4._ipfs.protocol.network.sendMessage(peer.peer.id, msg, function (err) {
                    if (err) {
                      ev.emit('getMetaData:error', err);
                      return ev;
                    }
                  });
                }
              });

              // paratii getMetaData signal.
              _this4._ipfs.on('protocol:incoming', function (peerId, command) {
                _this4._ipfs.log('paratii protocol: Received command ', command.payload.toString(), 'args: ', command.args.toString());
                var commandStr = command.payload.toString();
                var argsObj = void 0;
                try {
                  argsObj = JSON.parse(command.args.toString());
                } catch (e) {
                  _this4._ipfs.error('couldn\'t parse args, ', command.args.toString());
                }

                switch (commandStr) {
                  case 'getMetaData:error':
                    if (argsObj.hash === fileHash) {
                      console.log('DEBUG getMetaData ERROR: fileHash: ', fileHash, ' , errHash: ', argsObj.hash);
                      reject(argsObj.err);
                    }
                    break;
                  case 'getMetaData:done':
                    if (argsObj.hash === fileHash) {
                      var _result = argsObj.data;
                      resolve(_result);
                    }
                    break;
                  default:
                    _this4._ipfs.log('unknown command : ', commandStr);
                }
              });
            });
          });
        });
      });
    }

    /**
     * Signal the remote node to pin a File
     * @param  {Object} fileHash hash of the file to pin
     * @param  {Object} options  [description]
     * @return {Promise}  a Promise/EventEmitter that resolves inthe hash of the pinned file
     * @example paratii.ipfs.remote.pinFile('QmQP5SJzEBKy1uAGASDfEPqeFJ3HUbEp4eZzxvTLdZZYwB')
     */

  }, {
    key: 'pinFile',
    value: function pinFile(fileHash, options) {
      var _this5 = this;

      if (options === undefined) {
        options = {};
      }

      var schema = _joi2.default.object({
        author: _joi2.default.string().default('0x'), // ETH/PTI address of the file owner
        transcoder: _joi2.default.string().default(this.config.ipfs.defaultTranscoder),
        transcoderId: _joi2.default.any().default(Multiaddr(this.config.ipfs.defaultTranscoder).getPeerId()),
        size: _joi2.default.number().default(0)
      }).unknown();

      // this._pinResponseHandler = once(this._pinResponseHandler)

      this._ipfs.log('Signaling transcoder to pin ' + fileHash);

      var result = _joi2.default.validate(options, schema);
      var error = result.error;
      if (error) throw error;
      var opts = result.value;

      var ev = void 0;
      if (opts.ev) {
        ev = opts.ev;
      } else {
        ev = new _events.EventEmitter();
      }

      var msg = this._ipfs.protocol.createCommand('pin', { hash: fileHash, author: opts.author, size: opts.size });
      // This needs to be dynamic later on.
      this._node.swarm.connect(opts.transcoder, function (err, success) {
        if (err) return ev.emit('pin:error', err);
        _this5._node.swarm.peers(function (err, peers) {
          _this5._ipfs.log('peers: ', peers);
          if (err) return ev.emit('pin:error', err);
          peers.map(function (peer) {
            try {
              _this5._ipfs.log('peer.peer.toB58String(): ', peer.peer.toB58String());
              if (peer.peer.toB58String() === opts.transcoderId) {
                _this5._ipfs.log('sending pin msg to ' + peer.peer._idB58String + ' with request to pin ' + fileHash);
                _this5._ipfs.protocol.network.sendMessage(peer.peer, msg, function (err) {
                  if (err) {
                    ev.emit('pin:error', err);
                    console.log(err);
                    return ev;
                  }
                });
              }
            } catch (e) {
              console.log('PEER ERROR :', e, peer);
            }
          });

          // paratii pinning response.
          _this5._ipfs.on('protocol:incoming', _this5._pinResponseHandler(ev));
        });
      });

      return ev;
    }

    // TODO add docs
    /**
     * [_pinResponseHandler description]
     * @param  {Object} ev [description]
     * @return {Object}    [description]
     * @private
     */

  }, {
    key: '_pinResponseHandler',
    value: function _pinResponseHandler(ev) {
      var _this6 = this;

      return function (peerId, command) {
        _this6._ipfs.log('paratii protocol: Received command ', command.payload.toString(), 'args: ', command.args.toString());
        var commandStr = command.payload.toString();
        var argsObj = void 0;
        try {
          argsObj = JSON.parse(command.args.toString());
        } catch (e) {
          _this6._ipfs.log('couldn\'t parse args, ', command.args.toString());
        }

        switch (commandStr) {
          case 'pin:error':
            ev.emit('pin:error', argsObj.err);
            break;
          case 'pin:progress':
            ev.emit('pin:progress', argsObj.hash, argsObj.chunkSize, argsObj.percent);
            break;
          case 'pin:done':
            ev.emit('pin:done', argsObj.hash);
            break;
          default:
            _this6._ipfs.log('unknown command : ', commandStr);
        }
      };
    }
    /**
     * Requests the transcoderDropUrl to see if it's up (Easily adds a dozen seconds to check the status)
     * @return {Promise} that resolves in a boolean
     */

  }, {
    key: 'checkTranscoderDropUrl',
    value: function checkTranscoderDropUrl() {
      var _this7 = this;

      return _regenerator2.default.async(function checkTranscoderDropUrl$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              return _context.abrupt('return', new _promise2.default(function (resolve) {
                fetch(_this7.config.ipfs.transcoderDropUrl + '/fakehash').then(function (response) {
                  if (response.status === 200) {
                    resolve(true);
                  } else {
                    resolve(false);
                  }
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
     * Checks transcoder drop url and returns a detailed object
     * @return {Promise} that resolves in an object
     */

  }, {
    key: 'serviceCheckTranscoderDropUrl',
    value: function serviceCheckTranscoderDropUrl() {
      var _this8 = this;

      return _regenerator2.default.async(function serviceCheckTranscoderDropUrl$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              return _context2.abrupt('return', new _promise2.default(function (resolve) {
                var executionStart = new Date().getTime();
                var url = _this8.config.ipfs.transcoderDropUrl + '/fakehash';
                console.log(url);

                fetch(url).then(function (response) {
                  var reponseStatus = response.status;
                  if (reponseStatus === 200) {
                    var executionEnd = new Date().getTime();
                    var executionTime = executionEnd - executionStart;

                    var transcoderDropUrlServiceCheckObject = {
                      provider: url,
                      responseTime: executionTime,
                      response: reponseStatus,
                      responsive: true
                    };
                    resolve(transcoderDropUrlServiceCheckObject);
                  } else {
                    var _transcoderDropUrlServiceCheckObject = {
                      provider: url,
                      responseTime: 0,
                      response: reponseStatus,
                      responsive: false
                    };
                    resolve(_transcoderDropUrlServiceCheckObject);
                  }
                });
              }));

            case 1:
            case 'end':
              return _context2.stop();
          }
        }
      }, null, this);
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
      return _regenerator2.default.async(function checkBootstrapWebSocketDNS$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              return _context3.abrupt('return', new _promise2.default(function (resolve) {
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
              return _context3.stop();
          }
        }
      }, null, this);
    }
    /**
     * Checks the default transcoder
     * @return {Promise} that resolves in a boolean
     */

  }, {
    key: 'checkDefaultTranscoder',
    value: function checkDefaultTranscoder() {
      var splitDefaultTranscoder, defaultTranscoderCheck;
      return _regenerator2.default.async(function checkDefaultTranscoder$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              splitDefaultTranscoder = this.config.ipfs.defaultTranscoder.split('/');
              _context4.next = 3;
              return _regenerator2.default.awrap(this.checkBootstrapWebSocketDNS(splitDefaultTranscoder[2], splitDefaultTranscoder[4]));

            case 3:
              defaultTranscoderCheck = _context4.sent;
              return _context4.abrupt('return', defaultTranscoderCheck);

            case 5:
            case 'end':
              return _context4.stop();
          }
        }
      }, null, this);
    }
    /**
     * Checks the default transcoder and returns a detailed object
     * @return {Promise} that resolves in an object
     */

  }, {
    key: 'serviceCheckDefaultTranscoder',
    value: function serviceCheckDefaultTranscoder() {
      var splitDefaultTranscoder, executionStart, defaultTranscoderCheck, executionEnd, executionTime, defaultTranscoderObject;
      return _regenerator2.default.async(function serviceCheckDefaultTranscoder$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              splitDefaultTranscoder = this.config.ipfs.defaultTranscoder.split('/');
              executionStart = new Date().getTime();
              _context5.next = 4;
              return _regenerator2.default.awrap(this.checkBootstrapWebSocketDNS(splitDefaultTranscoder[2], splitDefaultTranscoder[4]));

            case 4:
              defaultTranscoderCheck = _context5.sent;
              executionEnd = new Date().getTime();
              executionTime = executionEnd - executionStart;
              defaultTranscoderObject = {};

              defaultTranscoderObject.provider = this.config.ipfs.defaultTranscoder;
              if (defaultTranscoderCheck === true) {
                defaultTranscoderObject.responseTime = executionTime;
                defaultTranscoderObject.response = 'can reach';
                defaultTranscoderObject.responsive = defaultTranscoderCheck;
              } else {
                defaultTranscoderObject.responseTime = 0;
                defaultTranscoderObject.response = 'cannot reach';
                defaultTranscoderObject.responsive = defaultTranscoderCheck;
              }

              return _context5.abrupt('return', defaultTranscoderObject);

            case 11:
            case 'end':
              return _context5.stop();
          }
        }
      }, null, this);
    }
    /**
     * Checks the remote IPFS node
     * @return {Promise} that resolves in a boolean
     */

  }, {
    key: 'checkRemoteIPFSNode',
    value: function checkRemoteIPFSNode() {
      var splitRemoteIPFSNode, remoteIPFSNodeCheck;
      return _regenerator2.default.async(function checkRemoteIPFSNode$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              splitRemoteIPFSNode = this.config.ipfs.remoteIPFSNode.split('/');
              _context6.next = 3;
              return _regenerator2.default.awrap(this.checkBootstrapWebSocketDNS(splitRemoteIPFSNode[2], splitRemoteIPFSNode[4]));

            case 3:
              remoteIPFSNodeCheck = _context6.sent;
              return _context6.abrupt('return', remoteIPFSNodeCheck);

            case 5:
            case 'end':
              return _context6.stop();
          }
        }
      }, null, this);
    }
    /**
     * Checks the remote IPFS node and returns a detailed object
     * @return {Promise} that resolves in an object
     */

  }, {
    key: 'serviceCheckRemoteIPFSNode',
    value: function serviceCheckRemoteIPFSNode() {
      var splitRemoteIPFSNode, executionStart, remoteIPFSNodeCheck, executionEnd, executionTime, remoteIPFSNodeObject;
      return _regenerator2.default.async(function serviceCheckRemoteIPFSNode$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              splitRemoteIPFSNode = this.config.ipfs.remoteIPFSNode.split('/');
              executionStart = new Date().getTime();
              _context7.next = 4;
              return _regenerator2.default.awrap(this.checkBootstrapWebSocketDNS(splitRemoteIPFSNode[2], splitRemoteIPFSNode[4]));

            case 4:
              remoteIPFSNodeCheck = _context7.sent;
              executionEnd = new Date().getTime();
              executionTime = executionEnd - executionStart;
              remoteIPFSNodeObject = {};

              remoteIPFSNodeObject.provider = this.config.ipfs.remoteIPFSNode;
              if (remoteIPFSNodeCheck === true) {
                remoteIPFSNodeObject.responseTime = executionTime;
                remoteIPFSNodeObject.response = 'can reach';
                remoteIPFSNodeObject.responsive = remoteIPFSNodeCheck;
              } else {
                remoteIPFSNodeObject.responseTime = 0;
                remoteIPFSNodeObject.response = 'cannot reach';
                remoteIPFSNodeObject.responsive = remoteIPFSNodeCheck;
              }

              return _context7.abrupt('return', remoteIPFSNodeObject);

            case 11:
            case 'end':
              return _context7.stop();
          }
        }
      }, null, this);
    }
  }]);
  return ParatiiIPFSRemote;
}(_events.EventEmitter);