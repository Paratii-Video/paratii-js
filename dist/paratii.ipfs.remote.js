/* global ArrayBuffer */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiIPFSRemote = undefined;

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

// import pull from 'pull-stream'
// import once from 'once'
// const pullFilereader = require('pull-filereader')
// const toPull = require('stream-to-pull-stream')
// const fs = require('fs')
// const path = require('path')
// const { eachSeries, nextTick } = require('async')
var Multiaddr = require('multiaddr');
// const Resumable = require('resumablejs')

/**
 * IPFS UPLOADER : Paratii IPFS uploader interface.
 * @extends EventEmitter
 * @param {ParatiiIPFSUploaderSchema} opts
 */

var ParatiiIPFSRemote = exports.ParatiiIPFSRemote = function (_EventEmitter) {
  (0, _inherits3.default)(ParatiiIPFSRemote, _EventEmitter);

  /**
  * @typedef {Array} ParatiiIPFSUploaderSchema
  * @property {?ipfsSchema} ipfs
  * @property {?Object} ParatiiIPFS
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
    return _this;
  }

  /**
   * convenience method for adding and transcoding files
   * @param {Array} files Array of HTML5 File Objects
    */


  (0, _createClass3.default)(ParatiiIPFSRemote, [{
    key: 'addAndTranscode',
    value: function addAndTranscode(files) {
      var _this2 = this;

      var ev = this.add(files);
      // ev.on('done', this._signalTranscoder.bind(this))
      ev.on('done', function (files) {
        _this2._signalTranscoder(files, ev);
      });
      return ev;
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
      var _this3 = this;

      return new _promise2.default(function (resolve, reject) {
        var schema = _joi2.default.object({
          transcoder: _joi2.default.string().default(_this3.config.ipfs.defaultTranscoder),
          transcoderId: _joi2.default.any().default(Multiaddr(_this3.config.ipfs.defaultTranscoder).getPeerId())
        }).unknown();

        _this3._ipfs.log('Signaling transcoder getMetaData...');
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
        _this3._ipfs.start().then(function () {
          var msg = _this3._ipfs.protocol.createCommand('getMetaData', { hash: fileHash });
          // FIXME : This is for dev, so we just signal our transcoder node.
          // This needs to be dynamic later on.
          _this3._ipfs.ipfs.swarm.connect(opts.transcoder, function (err, success) {
            if (err) return reject(err);

            opts.transcoderId = opts.transcoderId || Multiaddr(opts.transcoder).getPeerId();
            _this3._ipfs.log('transcoderId: ', opts.transcoderId);
            _this3._node.swarm.peers(function (err, peers) {
              _this3._ipfs.log('peers: ', peers);
              if (err) return reject(err);

              peers.map(function (peer) {
                _this3._ipfs.log('peerID : ', peer.peer.id.toB58String(), opts.transcoderId, peer.peer.id.toB58String() === opts.transcoder);
                if (peer.peer.id.toB58String() === opts.transcoderId) {
                  _this3._ipfs.log('sending getMetaData msg to ' + peer.peer.id.toB58String() + ' with request to transcode ' + fileHash);
                  _this3._ipfs.protocol.network.sendMessage(peer.peer.id, msg, function (err) {
                    if (err) {
                      ev.emit('getMetaData:error', err);
                      return ev;
                    }
                  });
                }
              });

              // paratii getMetaData signal.
              _this3._ipfs.on('protocol:incoming', function (peerId, command) {
                _this3._ipfs.log('paratii protocol: Received command ', command.payload.toString(), 'args: ', command.args.toString());
                var commandStr = command.payload.toString();
                var argsObj = void 0;
                try {
                  argsObj = JSON.parse(command.args.toString());
                } catch (e) {
                  _this3._ipfs.error('couldn\'t parse args, ', command.args.toString());
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
                    _this3._ipfs.log('unknown command : ', commandStr);
                }
              });
            });
          });
        });
      });
    }
    /**
     * [pinFile description]
     * @param  {Object} fileHash [description]
     * @param  {Object} options  [description]
     * @return {Object}          [description]
      */

  }, {
    key: 'pinFile',
    value: function pinFile(fileHash, options) {
      var _this4 = this;

      if (options === undefined) {
        options = {};
      }

      var schema = _joi2.default.object({
        author: _joi2.default.string().default('0x'), // ETH/PTI address of the file owner
        transcoder: _joi2.default.string().default(this.config.ipfs.defaultTranscoder),
        transcoderId: _joi2.default.any().default(Multiaddr(this.config.ipfs.defaultTranscoder).getPeerId()),
        size: _joi2.default.number().default(0)
      }).unknown();

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
      // FIXME : This is for dev, so we just signal our transcoder node.
      // This needs to be dynamic later on.
      this._node.swarm.connect(opts.transcoder, function (err, success) {
        if (err) return ev.emit('pin:error', err);
        console.log(4);
        _this4._node.swarm.peers(function (err, peers) {
          _this4._ipfs.log('peers: ', peers);
          if (err) return ev.emit('pin:error', err);
          peers.map(function (peer) {
            try {
              _this4._ipfs.log('peer.peer.toB58String(): ', peer.peer.toB58String());
              if (peer.peer.toB58String() === opts.transcoderId) {
                _this4._ipfs.log('sending pin msg to ' + peer.peer._idB58String + ' with request to pin ' + fileHash);
                _this4._ipfs.protocol.network.sendMessage(peer.peer, msg, function (err) {
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
          _this4._ipfs.on('protocol:incoming', _this4._pinResponseHandler(ev));
        });
      });

      return ev;
    }
    /**
     * [_pinResponseHandler description]
     * @param  {Object} ev [description]
     * @return {Object}    [description]
      */

  }, {
    key: '_pinResponseHandler',
    value: function _pinResponseHandler(ev) {
      var _this5 = this;

      return function (peerId, command) {
        _this5._ipfs.log('paratii protocol: Received command ', command.payload.toString(), 'args: ', command.args.toString());
        var commandStr = command.payload.toString();
        var argsObj = void 0;
        try {
          argsObj = JSON.parse(command.args.toString());
        } catch (e) {
          _this5._ipfs.log('couldn\'t parse args, ', command.args.toString());
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
            _this5._ipfs.log('unknown command : ', commandStr);
        }
      };
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
  return ParatiiIPFSRemote;
}(_events.EventEmitter);