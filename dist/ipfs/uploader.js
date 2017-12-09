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

    if (!opts || !opts.node) {
      throw new Error('IPFS Instance is required By UPloader.');
    }

    _this._ipfs = paratiiIPFS; // this is the paratii.ipfs.js
    _this._node = opts.node; // this is the actual IPFS node.
    _this._chunkSize = opts.chunkSize || 64048;
    return _this;
  }

  _createClass(Uploader, [{
    key: 'onDrop',
    value: function onDrop(ev) {}
  }, {
    key: 'uploadFiles',
    value: function uploadFiles(files) {
      var _this2 = this;

      var fileSize = 0;
      // await this._ipfs.getIPFSInstance()
      var total = 0;
      function updateProgress(chunkLength) {
        total += chunkLength;
        console.log('Progress \t', total, ' / ', fileSize, ' = ', Math.floor(total / fileSize * 100));
      }
      this._ipfs.start(function () {
        // replace this by a callback?
        // setInterval(() => {
        //   this._node._bitswap.engine.ledgerMap.forEach((ledger, peerId, ledgerMap) => {
        //     console.log(`${peerId} : ${JSON.stringify(ledger.accounting)}\n`)
        //   })
        // }, 5000)

        pull(pull.values(files), pull.through(function (file) {
          console.log('Adding ', file);
          fileSize = file.size;
          total = 0;
        }), pull.asyncMap(function (file, cb) {
          return pull(pull.values([{
            path: file.name,
            // content: pullFilereader(file)
            content: pull(pullFilereader(file), pull.through(function (chunk) {
              return updateProgress(chunk.length);
            }))
          }]), _this2._node.files.createAddPullStream({ chunkerOptions: { maxChunkSize: _this2._chunkSize } }), // default size 262144
          _this2._signalTranscoderPull(cb));
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
        _this2._ipfs.protocol.notifications.on('command', function (peerId, command) {
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
      var _this3 = this;

      return pull.collect(function (err, res) {
        if (err) {
          return callback(err);
        }
        var file = res[0];
        console.log('Adding %s finished', file.path);

        // statusEl.innerHTML += `Added ${file.path} as ${file.hash} ` + '<br>'
        // Trigger paratii transcoder signal

        var msg = _this3._ipfs.protocol.createCommand('transcode', { hash: file.hash, author: _this3.id.id });
        _this3._node.swarm.connect('/dns4/bootstrap.paratii.video/tcp/443/wss/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW', function (err, success) {
          if (err) throw err;
          _this3._node.swarm.peers(function (err, peers) {
            console.log('peers: ', peers);
            if (err) throw err;
            peers.map(function (peer) {
              console.log('sending transcode msg to ', peer.peer.id.toB58String());
              _this3._ipfs.protocol.network.sendMessage(peer.peer.id, msg, function (err) {
                if (err) console.warn('[Paratii-protocol] Error ', err);
              });

              if (peer.addr) {}
            });
            callback(null, file);
          });
        });
      });
    }
  }]);

  return Uploader;
}(EventEmitter);

module.exports = Uploader;