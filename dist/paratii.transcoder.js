/* global ArrayBuffer */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiTranscoder = undefined;

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

var Multiaddr = require('multiaddr');

/**
 * IPFS UPLOADER : Paratii IPFS uploader interface.
 * @extends EventEmitter
 * @param {ParatiiIPFSUploaderSchema} opts
 */

var ParatiiTranscoder = exports.ParatiiTranscoder = function (_EventEmitter) {
  (0, _inherits3.default)(ParatiiTranscoder, _EventEmitter);

  /**
  * @typedef {Array} ParatiiIPFSUploaderSchema
  * @property {?ipfsSchema} ipfs
  * @property {?Object} ParatiiIPFS
  */
  function ParatiiTranscoder(opts) {
    (0, _classCallCheck3.default)(this, ParatiiTranscoder);

    var _this = (0, _possibleConstructorReturn3.default)(this, (ParatiiTranscoder.__proto__ || (0, _getPrototypeOf2.default)(ParatiiTranscoder)).call(this));

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
    return _this;
  }

  /**
   * signals transcoder(s) to transcode fileHash
   * @param  {string} fileHash IPFS file hash.
   * @param  {Object} options  ref: https://github.com/Paratii-Video/paratii-lib/blob/master/docs/paratii-ipfs.md#ipfsuploadertranscodefilehash-options
   * @return {EvenEmitter} EventEmitter with the following events:<br>
   *    - 'uploader:progress': (hash, chunkSize, percent) client to transcoder upload progress.<br>
   *    - 'transcoding:started': (hash, author)<br>
   *    - 'transcoding:progress': (hash, size, percent)<br>
   *    - 'transcoding:downsample:ready' (hash, size)<br>
   *    - 'transcoding:done': (hash, transcoderResult) triggered when the transcoder is done - returns the hash of the transcoded file<br>
   *    - 'transcoder:error': (err) triggered whenever an error occurs.<br>
   */


  (0, _createClass3.default)(ParatiiTranscoder, [{
    key: 'transcode',
    value: function transcode(fileHash, options) {
      var _this2 = this;

      var schema = _joi2.default.object({
        author: _joi2.default.string().default('0x'), // ETH/PTI address of the file owner
        transcoder: _joi2.default.string().default(this.config.ipfs.defaultTranscoder),
        transcoderId: _joi2.default.any().default(Multiaddr(this.config.ipfs.defaultTranscoder).getPeerId())
      }).unknown();

      this._ipfs.log('Signaling transcoder...');

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

      if (fileHash === '') {
        // empty hash for testing eventemitter
        ev.emit('transcoding:done', { test: 1 });
        return ev;
      }
      var msg = this._ipfs.protocol.createCommand('transcode', { hash: fileHash, author: opts.author, size: opts.size });
      // FIXME : This is for dev, so we just signal our transcoder node.
      // This needs to be dynamic later on.
      this._node.swarm.connect(opts.transcoder, function (err, success) {
        if (err) return ev.emit('transcoding:error', err);

        opts.transcoderId = opts.transcoderId || Multiaddr(opts.transcoder).getPeerId();
        _this2._ipfs.log('transcoderId: ', opts.transcoderId);
        _this2._node.swarm.peers(function (err, peers) {
          _this2._ipfs.log('peers: ', peers);
          if (err) return ev.emit('transcoding:error', err);
          peers.map(function (peer) {
            try {
              _this2._ipfs.log('peerID : ', peer.peer.toB58String(), opts.transcoderId, peer.peer.toB58String() === opts.transcoder);
              if (peer.peer.toB58String() === opts.transcoderId) {
                _this2._ipfs.log('sending transcode msg to ' + peer.peer.toB58String() + ' with request to transcode ' + fileHash);
                _this2._ipfs.protocol.network.sendMessage(peer.peer, msg, function (err) {
                  if (err) {
                    ev.emit('transcoding:error', err);
                    return ev;
                  }
                });
              }
            } catch (e) {
              console.log('PEER ERROR :', e, peer);
            }
          });

          // paratii transcoder signal.
          _this2._ipfs.on('protocol:incoming', _this2._transcoderRespHander(ev, fileHash));
        });
      });
      return ev;
    }

    /**
     * handles responses from the paratii-protocol in case of transcoding.
     * @param  {EventEmitter} ev the transcoding job EventEmitter
     * @return {function}    returns various events based on transcoder response.
     * @example ?
     * @private
     */

  }, {
    key: '_transcoderRespHander',
    value: function _transcoderRespHander(ev, fileHash) {
      var _this3 = this;

      return function (peerId, command) {
        _this3._ipfs.log('paratii protocol: Received command ', command.payload.toString(), 'args: ', command.args.toString());
        var commandStr = command.payload.toString();
        var argsObj = void 0;
        try {
          argsObj = JSON.parse(command.args.toString());
        } catch (e) {
          _this3._ipfs.error('couldn\'t parse args, ', command.args.toString());
        }

        switch (commandStr) {
          case 'transcoding:error':
            console.log('DEBUG TRANSCODER ERROR: fileHash: ', fileHash, ' , errHash: ', argsObj.hash);
            if (argsObj.hash === fileHash) {
              ev.emit('transcoding:error', argsObj.err);
            }
            break;
          case 'transcoding:started':
            if (argsObj.hash === fileHash) {
              ev.emit('transcoding:started', argsObj.hash, argsObj.author);
            }
            break;
          case 'transcoding:progress':
            if (argsObj.hash === fileHash) {
              ev.emit('transcoding:progress', argsObj.hash, argsObj.size, argsObj.percent);
            }
            break;
          case 'uploader:progress':
            if (argsObj.hash === fileHash) {
              ev.emit('uploader:progress', argsObj.hash, argsObj.chunkSize, argsObj.percent);
            }
            break;
          case 'transcoding:downsample:ready':
            if (argsObj.hash === fileHash) {
              ev.emit('transcoding:downsample:ready', argsObj.hash, argsObj.size);
            }
            break;
          case 'transcoding:done':
            if (argsObj.hash === fileHash) {
              var result = JSON.parse(argsObj.result.toString());
              ev.emit('transcoding:done', argsObj.hash, result);
            }
            break;
          default:
            if (argsObj.hash === fileHash) {
              _this3._ipfs.log('unknown command : ', commandStr);
            }
        }
      };
    }
    /**
     * convenience method for adding and transcoding files
     * @param {Array} files Array of HTML5 File Objects
      */

  }, {
    key: 'addAndTranscode',
    value: function addAndTranscode(files) {
      var _this4 = this;

      var ev = this._ipfs.local.upload(files);
      // ev.on('done', this._signalTranscoder.bind(this))
      ev.on('done', function (files) {
        _this4._signalTranscoder(files, ev);
      });
      return ev;
    }
    /**
     * [_signalTranscoder description]
     * TODO RIVEDI I TIPI
     * @param  {Object} files [description]
     * @param  {Object} ev    [description]
     * @return {Object}       [description]
     * @private
     */

  }, {
    key: '_signalTranscoder',
    value: function _signalTranscoder(files, ev) {
      var file = void 0;
      if (Array.isArray(files)) {
        if (files.length < 1) {
          // FIXME THIS NEEDS TO BE REMOVED
          file = { hash: '' // testing something ...
            // this._ipfs.log('_signalTranscoder Got an empty Array. files: ', files)
            // return
          };
        } else {
          file = files[0];
        }
      } else {
        file = files;
      }

      if (!ev) {
        ev = new _events.EventEmitter();
      }

      this.transcode(file.hash, {
        author: '0x', // author address,
        ev: ev
      });
    }
    /**
     * [getMetaData description]
     * @param  {Object} fileHash [description]
     * @param  {Object} options  [description]
     * @return {Object}          [description]
      */

  }, {
    key: 'getMetaData',
    value: function getMetaData(fileHash, options) {
      var _this5 = this;

      return new _promise2.default(function (resolve, reject) {
        var schema = _joi2.default.object({
          transcoder: _joi2.default.string().default(_this5.config.ipfs.defaultTranscoder),
          transcoderId: _joi2.default.any().default(Multiaddr(_this5.config.ipfs.defaultTranscoder).getPeerId())
        }).unknown();

        _this5._ipfs.log('Signaling transcoder getMetaData...');
        var result = _joi2.default.validate(options, schema);
        var error = result.error;
        if (error) reject(error);
        var opts = result.value;
        console.log('opts: ', opts);
        var ev = void 0;
        if (opts.ev) {
          ev = opts.ev;
        } else {
          ev = new _events.EventEmitter();
        }
        _this5._ipfs.start().then(function () {
          var msg = _this5._ipfs.protocol.createCommand('getMetaData', { hash: fileHash });
          // FIXME : This is for dev, so we just signal our transcoder node.
          // This needs to be dynamic later on.
          _this5._ipfs.ipfs.swarm.connect(opts.transcoder, function (err, success) {
            if (err) return reject(err);

            opts.transcoderId = opts.transcoderId || Multiaddr(opts.transcoder).getPeerId();
            _this5._ipfs.log('transcoderId: ', opts.transcoderId);
            _this5._node.swarm.peers(function (err, peers) {
              _this5._ipfs.log('peers: ', peers);
              if (err) return reject(err);

              peers.map(function (peer) {
                _this5._ipfs.log('peerID : ', peer.peer.id.toB58String(), opts.transcoderId, peer.peer.id.toB58String() === opts.transcoder);
                if (peer.peer.id.toB58String() === opts.transcoderId) {
                  _this5._ipfs.log('sending getMetaData msg to ' + peer.peer.id.toB58String() + ' with request to transcode ' + fileHash);
                  _this5._ipfs.protocol.network.sendMessage(peer.peer.id, msg, function (err) {
                    if (err) {
                      ev.emit('getMetaData:error', err);
                      return ev;
                    }
                  });
                }
              });

              // paratii getMetaData signal.
              _this5._ipfs.on('protocol:incoming', function (peerId, command) {
                _this5._ipfs.log('paratii protocol: Received command ', command.payload.toString(), 'args: ', command.args.toString());
                var commandStr = command.payload.toString();
                var argsObj = void 0;
                try {
                  argsObj = JSON.parse(command.args.toString());
                } catch (e) {
                  _this5._ipfs.error('couldn\'t parse args, ', command.args.toString());
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
                      console.log('data: ', argsObj.data);
                      var _result = argsObj.data;
                      resolve(_result);
                    }
                    break;
                  default:
                    _this5._ipfs.log('unknown command : ', commandStr);
                }
              });
            });
          });
        });
      });
    }

    // grabYt (url, onResponse, callback) {
    //   let starttime
    //   let fileSize
    //   let video = ytdl(url)
    //   video.once('response', () => {
    //     this._ipfs.log(`starting ${url}`)
    //     starttime = Date.now()
    //     onResponse(null, starttime)
    //   })
    //
    //   video.on('error', (err) => {
    //     onResponse(err)
    //   })
    //
    //   video.on('progress', (chunkLength, downloaded, total) => {
    //     fileSize = total
    //     // const floatDownloaded = downloaded / total
    //     // const downloadedMinutes = (Date.now() - starttime) / 1000 / 60
    //     // readline.cursorTo(process.stdout, 0)
    //     // process.stdout.write(`${(floatDownloaded * 100).toFixed(2)}% downloaded`)
    //     // process.stdout.write(`(${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(total / 1024 / 1024).toFixed(2)}MB)\n`)
    //     // process.stdout.write(`running for: ${downloadedMinutes.toFixed(2)}minutes`)
    //     // process.stdout.write(`, estimated time left: ${(downloadedMinutes / floatDownloaded - downloadedMinutes).toFixed(2)}minutes `)
    //     // readline.moveCursor(process.stdout, 0, -1)
    //   })
    //
    //   video.on('end', () => {
    //     process.stdout.write('\n\n')
    //     // cb(null, output)
    //   })
    //
    //   var total = 0
    //   function updateProgress (chunkLength) {
    //     total += chunkLength
    //     this._ipfs.log('Progress \t', total, ' / ', fileSize, ' = ', Math.floor((total / fileSize) * 100))
    //   }
    //
    //   pull(
    //     pull.values([{
    //       path: url,
    //       content: pull(
    //         toPull(video),
    //         pull.through((chunk) => updateProgress(chunk.length))
    //       )
    //     }]),
    //     this._node.files.addPullStream({chunkerOptions: {maxChunkSize: this._chunkSize}}), // default size 262144
    //     this._signalTranscoderPull(callback)
    //   )
    // }
    //
    // grabVimeo (url, onResponse, callback) {
    //   let starttime
    //   // let total = 0
    //   let video = vidl(url, {quality: '720p'})
    //
    //   video.once('response', () => {
    //     this._ipfs.log(`starting ${url}`)
    //     starttime = Date.now()
    //     onResponse(null, starttime)
    //   })
    //
    //   video.on('data', (chunk) => {
    //     // total += chunk.length / 1024 / 1024
    //   })
    //
    //   video.on('end', () => {
    //     // process.stdout.write('\n\n')
    //     // cb(null, output)
    //   })
    //
    //   function updateProgress (chunkLength) {
    //     // this._ipfs.log('Progress \t', total, ' / ', fileSize, ' = ', Math.floor((total / fileSize) * 100))
    //   }
    //
    //   pull(
    //     pull.values([{
    //       path: url,
    //       content: pull(
    //         toPull(video),
    //         pull.through((chunk) => updateProgress(chunk.length))
    //       )
    //     }]),
    //     this._node.files.addPullStream({chunkerOptions: {maxChunkSize: this._chunkSize}}), // default size 262144
    //     this._signalTranscoderPull(callback)
    //   )
    // }
    //

  }]);
  return ParatiiTranscoder;
}(_events.EventEmitter);