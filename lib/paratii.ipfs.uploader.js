'use strict'

/**
 * @module IPFS UPLOADER : Paratii IPFS uploader interface.
 */

const { EventEmitter } = require('events')
const dopts = require('default-options')
const pull = require('pull-stream')
// const pullFilereader = require('pull-filereader')
const fs = require('fs')
const toPull = require('stream-to-pull-stream')
// const ytdl = require('ytdl-core')
// const vidl = require('vimeo-downloader')
// const readline = require('readline')
const path = require('path')
const { eachSeries, nextTick } = require('async')
const once = require('once')

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
        onDone: function (files) { return resolve(files) },
        onError: function (err) { return reject(err) }
      }
      console.log(opts)
      return that.upload(files, opts)
    })
  }

  /**
   * upload a file as is to the local IPFS node
   * @param  {file} file    HTML5 File Object
   * @param  {Object} options Holds various callbacks, ref: https://github.com/Paratii-Video/paratii-lib/blob/master/docs/paratii-ipfs.md#ipfsuploaderuploadfile-options
   */
  upload (files, options) {
    let defaults = {
      onStart: () => {}, // function()
      onError: (err) => { if (err) throw err }, // function (err)
      onFileReady: (file) => {}, // function(file)
      onProgress: (chunkLength, progress) => {}, // function(chunkLength)
      onDone: (file) => {} // function(file)
    }

    let opts = dopts(options, defaults, {allowUnknown: true})
    let meta = {} // holds File metadata.
    // let files = [file]
    this._ipfs.start(() => {
      // trigger onStart callback
      opts.onStart()

      pull(
        pull.values(files),
        pull.through((file) => {
          console.log('Adding ', file)
          meta.fileSize = file.size
          meta.total = 0
        }),
        pull.asyncMap((file, cb) => pull(
          pull.values([{
            path: file.name,
            // content: pullFilereader(file)
            content: pull(
              toPull(fs.createReadStream(file)), // file here is a path to file.
              pull.through((chunk) => opts.onProgress(chunk.length, Math.floor((meta.total + chunk.length) / meta.fileSize) * 100))
            )
          }]),
          this._node.files.addPullStream({chunkerOptions: {maxChunkSize: this._chunkSize}}), // default size 262144
          pull.collect((err, res) => {
            if (err) {
              return opts.onError(err)
            }
            const file = res[0]
            console.log('Adding %s finished', file.path)
            opts.onFileReady(file)
            setImmediate(() => {
              cb()
            })
          })
        )),
        pull.collect((err, files) => {
          if (err) {
            return opts.onError(err)
          }
          console.log('uploader Finished', files)
          return opts.onDone(files)
        })
      )
    })
  }

  /**
   * upload an entire directory to IPFS
   * @param  {String}   dirPath path to directory
   * @return {Promise}           returns the {hash, path, size} for the uploaded folder.
   */
  addDirectory (dirPath) {
    return new Promise((resolve, reject) => {
      // cb = once(cb)
      let resp = null
      // console.log('adding ', dirPath, ' to IPFS')

      const addStream = this._node.files.addReadableStream()
      addStream.on('data', (file) => {
        // console.log('dirPath ', dirPath)
        // console.log('file Added ', file)
        if (file.path === dirPath) {
          console.log('this is the hash to return ')
          resp = file
          nextTick(() => resolve(resp))
        }
      })

      addStream.on('end', () => {
        // console.log('addStream ended')
        // nextTick(() => cb(null, resp))
      })

      fs.readdir(dirPath, (err, files) => {
        if (err) return reject(err)
        eachSeries(files, (file, next) => {
          next = once(next)
          try {
            console.log('reading file ', file)
            let rStream = fs.createReadStream(path.join(dirPath, file))
            rStream.on('error', (err) => {
              if (err) {
                console.log('rStream Error ', err)
                return next()
              }
            })
            if (rStream) {
              addStream.write({
                path: path.join(dirPath, file),
                content: rStream
              })
            }
          } catch (e) {
            if (e) {
              console.log('createReadStream Error: ', e)
            }
          } finally {
          }
          // next()
          nextTick(() => next())
        }, (err) => {
          if (err) return reject(err)
          // addStream.destroy()
          addStream.end()
        })
      })
    })
  }

  /**
   * signals transcoder(s) to transcode fileHash
   * @param  {String} fileHash IPFS file hash.
   * @param  {Object} options  ref: https://github.com/Paratii-Video/paratii-lib/blob/master/docs/paratii-ipfs.md#ipfsuploadertranscodefilehash-options
   */
  transcode (fileHash, options) {
    let defaults = {
      author: '0x', // ETH/PTI address of the file owner
      transcoder: '/dns4/bootstrap.paratii.video/tcp/443/wss/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW', // Address of transcoder
      onError: (err) => { if (err) throw err },
      onProgress: (progress) => { }, // TODO update client on progress.
      onDone: (err, result) => { if (err) throw err }
    }

    let opts = dopts(options, defaults, {allowUnknown: true})

    let msg = this._ipfs.protocol.createCommand('transcode', {hash: fileHash, author: opts.author})
    // FIXME : This is for dev, so we just signal our transcoder node.
    // This needs to be dynamic later on.
    this._node.swarm.connect(opts.transcoder, (err, success) => {
      if (err) return opts.onError(err)
      this._node.swarm.peers((err, peers) => {
        console.log('peers: ', peers)
        if (err) return opts.onError(err)
        peers.map((peer) => {
          console.log('sending transcode msg to ', peer.peer.id.toB58String())
          this._ipfs.protocol.network.sendMessage(peer.peer.id, msg, (err) => {
            if (err) opts.onError(err)
          })

          if (peer.addr) {
          }
        })

        // paratii transcoder signal.
        this._ipfs.protocol.notifications.on('command', (peerId, command) => {
          console.log('paratii protocol: Got Command ', command)
          if (command.payload.toString() === 'transcoding:done') {
            let args = JSON.parse(command.args.toString())
            let result = JSON.parse(args.result)

            if (args.hash === fileHash) {
              console.log('args: ', args)
              console.log('result: ', result)
              return opts.onDone(null, fileHash)
            }
          }
        })

        opts.onProgress(0) // TODO : add an event for starting.
      })
    })
  }

  addAndTranscode (files) {
    this.upload(files, {onDone: this._signalTranscoder})
  }

  _signalTranscoder (files) {
    let file
    if (Array.isArray(files)) {
      if (files.length < 1) {
        console.log('_signalTranscoder Got an empty Array. files: ', files)
        return
      }
      file = files[0]
    } else {
      file = files
    }

    this.transcode(file.hash, {
      author: '0x', // author address,
      onDone: (err, folderHash) => {
        if (err) throw err
        console.log('transcoder done ', folderHash)
      }
    })
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
