'use strict';

/**
 * @module IPFS UPLOADER : Paratii IPFS uploader interface.
 */

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require('events'),
    EventEmitter = _require.EventEmitter;

var dopts = require('default-options');
var pull = require('pull-stream');
// const pullFilereader = require('pull-filereader')
var fs = require('fs');
var toPull = require('stream-to-pull-stream');
// const ytdl = require('ytdl-core')
// const vidl = require('vimeo-downloader')
// const readline = require('readline')
var path = require('path');

var _require2 = require('async'),
    eachSeries = _require2.eachSeries,
    nextTick = _require2.nextTick;

var once = require('once');

var Uploader = function (_EventEmitter) {
  (0, _inherits3.default)(Uploader, _EventEmitter);

  function Uploader(paratiiIPFS, opts) {
    (0, _classCallCheck3.default)(this, Uploader);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Uploader.__proto__ || (0, _getPrototypeOf2.default)(Uploader)).call(this));

    _this.setOptions(opts);
    _this._ipfs = paratiiIPFS; // this is the paratii.ipfs.js
    return _this;
  }

  (0, _createClass3.default)(Uploader, [{
    key: 'setOptions',
    value: function setOptions() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      // if (!opts || !opts.node) {
      //   throw new Error('IPFS Instance is required By Uploader.')
      // }
      this._node = opts.node; // this is the actual IPFS node.
      this._chunkSize = opts.chunkSize || 64048;
    }
  }, {
    key: 'onDrop',
    value: function onDrop(ev) {}
  }, {
    key: 'add',
    value: function add(file) {
      var that = this;
      return new _promise2.default(function (resolve, reject) {
        var files = void 0;
        if (Array.isArray(file)) {
          files = file;
        } else {
          files = [file];
        }

        var opts = {
          onDone: function onDone(files) {
            return resolve(files);
          },
          onError: function onError(err) {
            return reject(err);
          }
        };
        console.log(opts);
        return that.upload(files, opts);
      });
    }

    /**
     * upload a file as is to the local IPFS node
     * @param  {file} file    HTML5 File Object
     * @param  {Object} options Holds various callbacks, ref: https://github.com/Paratii-Video/paratii-lib/blob/master/docs/paratii-ipfs.md#ipfsuploaderuploadfile-options
     */

  }, {
    key: 'upload',
    value: function upload(files, options) {
      var _this2 = this;

      var defaults = {
        onStart: function onStart() {}, // function()
        onError: function onError(err) {
          if (err) throw err;
        }, // function (err)
        onFileReady: function onFileReady(file) {}, // function(file)
        onProgress: function onProgress(chunkLength, progress) {}, // function(chunkLength)
        onDone: function onDone(file) {} // function(file)
      };

      var opts = dopts(options, defaults, { allowUnknown: true });
      var meta = {}; // holds File metadata.
      // let files = [file]
      this._ipfs.start(function () {
        // trigger onStart callback
        opts.onStart();

        pull(pull.values(files), pull.through(function (file) {
          console.log('Adding ', file);
          meta.fileSize = file.size;
          meta.total = 0;
        }), pull.asyncMap(function (file, cb) {
          return pull(pull.values([{
            path: file.name,
            // content: pullFilereader(file)
            content: pull(toPull(fs.createReadStream(file)), // file here is a path to file.
            pull.through(function (chunk) {
              return opts.onProgress(chunk.length, Math.floor((meta.total + chunk.length) / meta.fileSize) * 100);
            }))
          }]), _this2._node.files.addPullStream({ chunkerOptions: { maxChunkSize: _this2._chunkSize } }), // default size 262144
          pull.collect(function (err, res) {
            if (err) {
              return opts.onError(err);
            }
            var file = res[0];
            console.log('Adding %s finished', file.path);
            opts.onFileReady(file);
            (0, _setImmediate3.default)(function () {
              cb();
            });
          }));
        }), pull.collect(function (err, files) {
          if (err) {
            return opts.onError(err);
          }
          console.log('uploader Finished', files);
          return opts.onDone(files);
        }));
      });
    }

    /**
     * upload an entire directory to IPFS
     * @param  {String}   dirPath path to directory
     * @param  {Function} cb      (err, hash)
     * @return {String}           returns the hash for the uploaded folder.
     */

  }, {
    key: 'uploadDir',
    value: function uploadDir(dirPath, cb) {
      cb = once(cb);
      var resp = null;
      console.log('adding ', dirPath, ' to IPFS');
      var addStream = this._node.files.addReadableStream();
      addStream.on('data', function (file) {
        console.log('dirPath ', dirPath);
        console.log('file Added ', file);
        if ('/' + file.path === dirPath) {
          console.log('this is the hash to return ');
          resp = file;
          nextTick(function () {
            return cb(null, resp);
          });
        }
      });

      addStream.on('end', function () {
        console.log('addStream ended');
        // nextTick(() => cb(null, resp))
      });

      fs.readdir(dirPath, function (err, files) {
        if (err) return cb(err);
        eachSeries(files, function (file, next) {
          next = once(next);
          try {
            console.log('reading file ', file);
            var rStream = fs.createReadStream(path.join(dirPath, file));
            rStream.on('error', function (err) {
              if (err) {
                console.log('rStream Error ', err);
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
              console.log('gotcha ', e);
            }
          } finally {}
          // next()
          nextTick(function () {
            return next();
          });
        }, function (err) {
          if (err) return cb(err);
          // addStream.destroy()
          addStream.end();
        });
      });
    }

    /**
     * signals transcoder(s) to transcode fileHash
     * @param  {String} fileHash IPFS file hash.
     * @param  {Object} options  ref: https://github.com/Paratii-Video/paratii-lib/blob/master/docs/paratii-ipfs.md#ipfsuploadertranscodefilehash-options
     */

  }, {
    key: 'transcode',
    value: function transcode(fileHash, options) {
      var _this3 = this;

      var defaults = {
        author: '0x', // ETH/PTI address of the file owner
        transcoder: '/dns4/bootstrap.paratii.video/tcp/443/wss/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW', // Address of transcoder
        onError: function onError(err) {
          if (err) throw err;
        },
        onProgress: function onProgress(progress) {}, // TODO update client on progress.
        onDone: function onDone(err, result) {
          if (err) throw err;
        }
      };

      var opts = dopts(options, defaults, { allowUnknown: true });

      var msg = this._ipfs.protocol.createCommand('transcode', { hash: fileHash, author: opts.author });
      // FIXME : This is for dev, so we just signal our transcoder node.
      // This needs to be dynamic later on.
      this._node.swarm.connect(opts.transcoder, function (err, success) {
        if (err) return opts.onError(err);
        _this3._node.swarm.peers(function (err, peers) {
          console.log('peers: ', peers);
          if (err) return opts.onError(err);
          peers.map(function (peer) {
            console.log('sending transcode msg to ', peer.peer.id.toB58String());
            _this3._ipfs.protocol.network.sendMessage(peer.peer.id, msg, function (err) {
              if (err) opts.onError(err);
            });

            if (peer.addr) {}
          });

          // paratii transcoder signal.
          _this3._ipfs.protocol.notifications.on('command', function (peerId, command) {
            console.log('paratii protocol: Got Command ', command);
            if (command.payload.toString() === 'transcoding:done') {
              var args = JSON.parse(command.args.toString());
              var result = JSON.parse(args.result);

              if (args.hash === fileHash) {
                console.log('args: ', args);
                console.log('result: ', result);
                return opts.onDone(null, fileHash);
              }
            }
          });

          opts.onProgress(0); // TODO : add an event for starting.
        });
      });
    }
  }, {
    key: 'addAndTranscode',
    value: function addAndTranscode(files) {
      this.upload(files, { onDone: this._signalTranscoder });
    }
  }, {
    key: '_signalTranscoder',
    value: function _signalTranscoder(files) {
      var file = void 0;
      if (Array.isArray(files)) {
        if (files.length < 1) {
          console.log('_signalTranscoder Got an empty Array. files: ', files);
          return;
        }
        file = files[0];
      } else {
        file = files;
      }

      this.transcode(file.hash, {
        author: '0x', // author address,
        onDone: function onDone(err, folderHash) {
          if (err) throw err;
          console.log('transcoder done ', folderHash);
        }
      });
    }

    // grabYt (url, onResponse, callback) {
    //   let starttime
    //   let fileSize
    //   let video = ytdl(url)
    //   video.once('response', () => {
    //     console.log(`starting ${url}`)
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
    //     console.log('Progress \t', total, ' / ', fileSize, ' = ', Math.floor((total / fileSize) * 100))
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
    //     console.log(`starting ${url}`)
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
    //     // console.log('Progress \t', total, ' / ', fileSize, ' = ', Math.floor((total / fileSize) * 100))
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

  }, {
    key: '_signalTranscoderPull',
    value: function _signalTranscoderPull(callback) {
      var _this4 = this;

      return pull.collect(function (err, res) {
        if (err) {
          return callback(err);
        }
        var file = res[0];
        console.log('Adding %s finished', file.path);

        // statusEl.innerHTML += `Added ${file.path} as ${file.hash} ` + '<br>'
        // Trigger paratii transcoder signal
        _this4.signalTrancoder(file, callback);
      });
    }
  }, {
    key: 'signalTranscoder',
    value: function signalTranscoder(file, callback) {
      var _this5 = this;

      var msg = this._ipfs.protocol.createCommand('transcode', { hash: file.hash, author: this.id.id });
      this._node.swarm.connect('/dns4/bootstrap.paratii.video/tcp/443/wss/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW', function (err, success) {
        if (err) throw err;
        _this5._node.swarm.peers(function (err, peers) {
          console.log('peers: ', peers);
          if (err) throw err;
          peers.map(function (peer) {
            console.log('sending transcode msg to ', peer.peer.id.toB58String());
            _this5._ipfs.protocol.network.sendMessage(peer.peer.id, msg, function (err) {
              if (err) console.warn('[Paratii-protocol] Error ', err);
            });

            if (peer.addr) {}
          });
          callback(null, file);
        });
      });
      // paratii transcoder signal.
      this._ipfs.protocol.notifications.on('command', function (peerId, command) {
        console.log('paratii protocol: Got Command ', command);
        if (command.payload.toString() === 'transcoding:done') {
          var args = JSON.parse(command.args.toString());
          var result = JSON.parse(args.result);
          console.log('args: ', args);
          console.log('result: ', result);
          // statusEl.innerHTML += `Video HLS link: /ipfs/${result.master.hash}\n`

          // titleEl = document.querySelector('#input-title')
          // console.log('titleEl: ', titleEl)
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
          //       console.log('[upload] Video Uploaded: ', videoId)
          //       statusEl.innerHTML += '\n Video Uploaded go to <b><a href="/play/' + videoId + '">/play/' + videoId + '</a></b>\n'
          //     })
        }
      });
    }
  }]);
  return Uploader;
}(EventEmitter);

module.exports = Uploader;