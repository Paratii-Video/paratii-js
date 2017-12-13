'use strict'

/**
 * @module IPFS UPLOADER : Paratii IPFS uploader interface.
 */

const { EventEmitter } = require('events')
const pull = require('pull-stream')
const pullFilereader = require('pull-filereader')
const toPull = require('stream-to-pull-stream')
const ytdl = require('ytdl-core')
// const readline = require('readline')
const vidl = require('vimeo-downloader')
const dopts = require('default-options')

class Uploader extends EventEmitter {
  constructor (paratiiIPFS, opts) {
    super()
    this.setOptions(opts)
    this._ipfs = paratiiIPFS // this is the paratii.ipfs.js
  }

  setOptions (opts = {}) {
    // if (!opts || !opts.node) {
    //   throw new Error('IPFS Instance is required By Uploader.')
    // }
    this._node = opts.node // this is the actual IPFS node.
    this._chunkSize = opts.chunkSize || 64048
  }

  onDrop (ev) {

  }

  add (file) {
    let that = this
    return new Promise(function (resolve, reject) {
      let files
      if (Array.isArray(file)) {
        files = file
      } else {
        files = [file]
      }

      let opts = {
        onDone: function (files) { resolve(files) },
        onError: function (err) { reject(err) }
      }
      console.log(opts)
      return that.uploadFiles(files, opts)
    })
  }

  async uploadFiles (files, options, cb) {
    // TODO return proper promsie with status updates
    if (!cb) {
      cb = function (err, files) {
        if (err) { throw err }
      }
    }
    let _this = this
    let defaults = {
      onStart: function () {
        _this._ipfs.log('Upload started')
        // setInterval(() => {
        //   this.ipfs._bitswap.engine.ledgerMap.forEach((ledger, peerId, ledgerMap) => {
        //     this.log(`${peerId} : ${JSON.stringify(ledger.accounting)}\n`)
        //   })
        // }, 5000)
      },
      onProgress: function (chunkLength) {
        total += chunkLength
        this.log('Progress \t', total, ' / ', fileSize, ' = ', Math.floor((total / fileSize) * 100))
      },
      onDone: function (files) {
        this.log('Adding %s finished', files)
        // statusEl.innerHTML += `Added ${file.path} as ${file.hash} ` + '<br>'
        // Trigger paratii transcoder signal
        // this.transcode({hash: file.hash, author: this.id.id})
      },
      onError: Function,
      onFileReady: Function // function(file)
    }
    options = dopts(options, defaults)

    var fileSize = 0
    // await this._ipfs.getIPFSInstance()
    var total = 0
    function updateProgress (chunkLength) {
      total += chunkLength
      console.log('Progress \t', total, ' / ', fileSize, ' = ', Math.floor((total / fileSize) * 100))
    }
    console.log('Starting ipfs..')

    if (files.length === 0) {
      console.log(options)
      if (options.onDone) {
        return options.onDone(files)
      } else {
        return files
      }
    }
    this._ipfs.start(() => {
      options.onStart()
      // replace this by a callback?
      // setInterval(() => {
      //   this._node._bitswap.engine.ledgerMap.forEach((ledger, peerId, ledgerMap) => {
      //     console.log(`${peerId} : ${JSON.stringify(ledger.accounting)}\n`)
      //   })
      // }, 5000)

      pull(
        pull.values(files),
        pull.through((file) => {
          console.log('Adding ', file)
          fileSize = file.size
          total = 0
        }),
        pull.asyncMap((file, cb) => pull(

          pull.values([{
            path: file.name,
            // content: pullFilereader(file)
            content: pull(
              pullFilereader(file),
              pull.through((chunk) => updateProgress(chunk.length))
            )
          }]),
          this._node.files.createAddPullStream({chunkerOptions: {maxChunkSize: this._chunkSize}}), // default size 262144
          options.onDone(file)

        )),
        pull.collect((err, files) => {
          if (err) {
            options.onError(err)
          }
          cb(null, files)
          // if (files && files.length) {
          //   statusEl.innerHTML += `All Done!\n`
          //   statusEl.innerHTML += `Don't Close this window. signaling transcoder...\n`
          // }
        })
      )
    })
  }

  addAndTranscode (files) {
    this.uploadFiles(files, {onDone: this._signalTranscoder})
  }

  grabYt (url, onResponse, callback) {
    let starttime
    let fileSize
    let video = ytdl(url)
    video.once('response', () => {
      console.log(`starting ${url}`)
      starttime = Date.now()
      onResponse(null, starttime)
    })

    video.on('error', (err) => {
      onResponse(err)
    })

    video.on('progress', (chunkLength, downloaded, total) => {
      fileSize = total
      // const floatDownloaded = downloaded / total
      // const downloadedMinutes = (Date.now() - starttime) / 1000 / 60
      // readline.cursorTo(process.stdout, 0)
      // process.stdout.write(`${(floatDownloaded * 100).toFixed(2)}% downloaded`)
      // process.stdout.write(`(${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(total / 1024 / 1024).toFixed(2)}MB)\n`)
      // process.stdout.write(`running for: ${downloadedMinutes.toFixed(2)}minutes`)
      // process.stdout.write(`, estimated time left: ${(downloadedMinutes / floatDownloaded - downloadedMinutes).toFixed(2)}minutes `)
      // readline.moveCursor(process.stdout, 0, -1)
    })

    video.on('end', () => {
      process.stdout.write('\n\n')
      // cb(null, output)
    })

    var total = 0
    function updateProgress (chunkLength) {
      total += chunkLength
      console.log('Progress \t', total, ' / ', fileSize, ' = ', Math.floor((total / fileSize) * 100))
    }

    pull(
      pull.values([{
        path: url,
        content: pull(
          toPull(video),
          pull.through((chunk) => updateProgress(chunk.length))
        )
      }]),
      this._node.files.addPullStream({chunkerOptions: {maxChunkSize: this._chunkSize}}), // default size 262144
      this._signalTranscoderPull(callback)
    )
  }

  grabVimeo (url, onResponse, callback) {
    let starttime
    // let total = 0
    let video = vidl(url, {quality: '720p'})

    video.once('response', () => {
      console.log(`starting ${url}`)
      starttime = Date.now()
      onResponse(null, starttime)
    })

    video.on('data', (chunk) => {
      // total += chunk.length / 1024 / 1024
    })

    video.on('end', () => {
      // process.stdout.write('\n\n')
      // cb(null, output)
    })

    function updateProgress (chunkLength) {
      // console.log('Progress \t', total, ' / ', fileSize, ' = ', Math.floor((total / fileSize) * 100))
    }

    pull(
      pull.values([{
        path: url,
        content: pull(
          toPull(video),
          pull.through((chunk) => updateProgress(chunk.length))
        )
      }]),
      this._node.files.addPullStream({chunkerOptions: {maxChunkSize: this._chunkSize}}), // default size 262144
      this._signalTranscoderPull(callback)
    )
  }

  _signalTranscoderPull (callback) {
    return pull.collect((err, res) => {
      if (err) {
        return callback(err)
      }
      const file = res[0]
      console.log('Adding %s finished', file.path)

      // statusEl.innerHTML += `Added ${file.path} as ${file.hash} ` + '<br>'
      // Trigger paratii transcoder signal
      this.signalTrancoder(file, callback)
    })
  }

  signalTranscoder (file, callback) {
    let msg = this._ipfs.protocol.createCommand('transcode', {hash: file.hash, author: this.id.id})
    this._node.swarm.connect('/dns4/bootstrap.paratii.video/tcp/443/wss/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW', (err, success) => {
      if (err) throw err
      this._node.swarm.peers((err, peers) => {
        console.log('peers: ', peers)
        if (err) throw err
        peers.map((peer) => {
          console.log('sending transcode msg to ', peer.peer.id.toB58String())
          this._ipfs.protocol.network.sendMessage(peer.peer.id, msg, (err) => {
            if (err) console.warn('[Paratii-protocol] Error ', err)
          })

          if (peer.addr) {
          }
        })
        callback(null, file)
      })
    })
      // paratii transcoder signal.
    this._ipfs.protocol.notifications.on('command', (peerId, command) => {
      console.log('paratii protocol: Got Command ', command)
      if (command.payload.toString() === 'transcoding:done') {
        let args = JSON.parse(command.args.toString())
        let result = JSON.parse(args.result)
        console.log('args: ', args)
        console.log('result: ', result)
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
    })
  }
}

module.exports = Uploader
