'use strict';

/**
 * @module IPFS UPLOADER : Paratii IPFS uploader interface.
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('events'),
    EventEmitter = _require.EventEmitter;

var dopts = require('default-options');
var pull = require('pull-stream');
var pullFilereader = require('pull-filereader');
var toPull = require('stream-to-pull-stream');
var ytdl = require('ytdl-core');
// const readline = require('readline')
var vidl = require('vimeo-downloader');

var Uploader = function (_EventEmitter) {
  _inherits(Uploader, _EventEmitter);

  function Uploader(paratiiIPFS, opts) {
    _classCallCheck(this, Uploader);

    var _this = _possibleConstructorReturn(this, (Uploader.__proto__ || Object.getPrototypeOf(Uploader)).call(this));

    _this.setOptions(opts);
    _this._ipfs = paratiiIPFS; // this is the paratii.ipfs.js
    return _this;
  }

  _createClass(Uploader, [{
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
      return new Promise(function (resolve, reject) {
        var files = void 0;
        if (Array.isArray(file)) {
          files = file;
        } else {
          files = [file];
        }

        var opts = {
          onDone: function onDone(files) {
            resolve(files);
          },
          onError: function onError(err) {
            reject(err);
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
            content: pull(pullFilereader(file), pull.through(function (chunk) {
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
          }));
        }), pull.collect(function (err, files) {
          if (err) {
            return opts.onError(err);
          }

          return opts.onDone(files);
        }));
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
  }, {
    key: 'grabYt',
    value: function grabYt(url, onResponse, callback) {
      var starttime = void 0;
      var fileSize = void 0;
      var video = ytdl(url);
      video.once('response', function () {
        console.log('starting ' + url);
        starttime = Date.now();
        onResponse(null, starttime);
      });

      video.on('error', function (err) {
        onResponse(err);
      });

      video.on('progress', function (chunkLength, downloaded, total) {
        fileSize = total;
        // const floatDownloaded = downloaded / total
        // const downloadedMinutes = (Date.now() - starttime) / 1000 / 60
        // readline.cursorTo(process.stdout, 0)
        // process.stdout.write(`${(floatDownloaded * 100).toFixed(2)}% downloaded`)
        // process.stdout.write(`(${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(total / 1024 / 1024).toFixed(2)}MB)\n`)
        // process.stdout.write(`running for: ${downloadedMinutes.toFixed(2)}minutes`)
        // process.stdout.write(`, estimated time left: ${(downloadedMinutes / floatDownloaded - downloadedMinutes).toFixed(2)}minutes `)
        // readline.moveCursor(process.stdout, 0, -1)
      });

      video.on('end', function () {
        process.stdout.write('\n\n');
        // cb(null, output)
      });

      var total = 0;
      function updateProgress(chunkLength) {
        total += chunkLength;
        console.log('Progress \t', total, ' / ', fileSize, ' = ', Math.floor(total / fileSize * 100));
      }

      pull(pull.values([{
        path: url,
        content: pull(toPull(video), pull.through(function (chunk) {
          return updateProgress(chunk.length);
        }))
      }]), this._node.files.addPullStream({ chunkerOptions: { maxChunkSize: this._chunkSize } }), // default size 262144
      this._signalTranscoderPull(callback));
    }
  }, {
    key: 'grabVimeo',
    value: function grabVimeo(url, onResponse, callback) {
      var starttime = void 0;
      // let total = 0
      var video = vidl(url, { quality: '720p' });

      video.once('response', function () {
        console.log('starting ' + url);
        starttime = Date.now();
        onResponse(null, starttime);
      });

      video.on('data', function (chunk) {
        // total += chunk.length / 1024 / 1024
      });

      video.on('end', function () {
        // process.stdout.write('\n\n')
        // cb(null, output)
      });

      function updateProgress(chunkLength) {
        // console.log('Progress \t', total, ' / ', fileSize, ' = ', Math.floor((total / fileSize) * 100))
      }

      pull(pull.values([{
        path: url,
        content: pull(toPull(video), pull.through(function (chunk) {
          return updateProgress(chunk.length);
        }))
      }]), this._node.files.addPullStream({ chunkerOptions: { maxChunkSize: this._chunkSize } }), // default size 262144
      this._signalTranscoderPull(callback));
    }
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