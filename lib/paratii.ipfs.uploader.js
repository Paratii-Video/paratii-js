/* global File, ArrayBuffer */
'use strict'

/**
 * @module IPFS UPLOADER : Paratii IPFS uploader interface.
 */

const { EventEmitter } = require('events')
const dopts = require('default-options')
const pull = require('pull-stream')
const pullFilereader = require('pull-filereader')
const toPull = require('stream-to-pull-stream')
const fs = require('fs')
const path = require('path')
const { eachSeries, nextTick } = require('async')
const once = require('once')
// const ytdl = require('ytdl-core')
// const vidl = require('vimeo-downloader')
// const readline = require('readline')

class Uploader extends EventEmitter {
  constructor (paratiiIPFS, opts) {
    super()
    this.setOptions(opts)
    this._ipfs = paratiiIPFS // this is the paratii.ipfs.js
    // console.log('========================browser-uploader=====================')
  }

  setOptions (opts = {}) {
    // if (!opts || !opts.node) {
    //   throw new Error('IPFS Instance is required By Uploader.')
    // }
    this._node = opts.node // this is the actual IPFS node.
    this._chunkSize = opts.chunkSize || 64048
    this._defaultTranscoder = opts.defaultTranscoder || '/dns4/bootstrap.paratii.video/tcp/443/wss/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW' // Address of transcoder
  }

  onDrop (ev) {

  }

  /**
   * uploads a single file to local IPFS node
   * @param {File} file HTML5 File Object.
   * @returns {EventEmitter} checkout the upload function below for details.
   */
  add (file) {
    let files
    if (Array.isArray(file)) {
      files = file
    } else {
      files = [file]
    }

    let result = []

    for (let i = 0; i < files.length; i++) {
      // check if File is actually available or not.
      // if not it means we're not in the browser land.
      if (typeof File !== 'undefined') {
        if (files[i] instanceof File) {
          result.push(this.html5FileToPull(files[i]))
        } else {
          result.push(this.fsFileToPull(files[i]))
        }
      } else {
        result.push(this.fsFileToPull(files[i]))
      }
    }

    return this.upload(result)
  }

  /**
   * returns a generic File Object with a Pull Stream from an HTML5 File
   * @param  {File} file HTML5 File Object
   * @return {Object}      generic file object.
   */
  html5FileToPull (file) {
    return {
      name: file.name,
      size: file.size,
      _pullStream: pullFilereader(file)
    }
  }

  /**
   * returns a generic file Object from a file path
   * @param  {String} filePath Path to file.
   * @return {Object}          generic file object.
   */
  fsFileToPull (filePath) {
    let stats = fs.statSync(filePath)
    if (stats) {
      return {
        name: path.basename(filePath),
        size: stats.size,
        _pullStream: toPull(fs.createReadStream(filePath))
      }
    } else {
      return null
    }
  }

  /**
   * upload an Array of files as is to the local IPFS node
   * @param  {Array} files    HTML5 File Object Array.
   * @return {EventEmitter} returns EventEmitter with the following events:
   *    - 'start': uploader started.
   *    - 'progress': (chunkLength, progressPercent)
   *    - 'fileReady': (file) triggered when a file is uploaded.
   *    - 'done': (files) triggered when the uploader is done.
   *    - 'error': (err) triggered whenever an error occurs.
   */
  upload (files) {
    let meta = {} // holds File metadata.
    let ev = new EventEmitter()

    this._ipfs.start(() => {
      // trigger onStart callback
      ev.emit('start')

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
              file._pullStream,
              pull.through((chunk) => ev.emit('progress', chunk.length, Math.floor((meta.total += chunk.length) * 1.0 / meta.fileSize * 100)))
            )
          }]),
          this._node.files.addPullStream({chunkerOptions: {maxChunkSize: this._chunkSize}}), // default size 262144
          pull.collect((err, res) => {
            if (err) {
              return ev.emit('error', err)
            }
            const file = res[0]
            console.log('Adding %s finished as %s', file.path, file.hash)
            ev.emit('fileReady', file)
            cb(null, file)
          })
        )),
        pull.collect((err, files) => {
          if (err) {
            ev.emit('error', err)
          }
          console.log('uploader is DONE')
          ev.emit('done', files)
        })
      )
    })

    return ev
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
   * @return {EventEmitter} returns EventEmitter with the following events:
   *    - 'transcoding:started': (hash, author)
   *    - 'transcoding:progress': (hash, size, percent)
   *    - 'transcoding:downsample:ready' (hash, size)
   *    - 'transcoding:done': (hash, transcoderResult) triggered when the transcoder is done - returns the hash of the transcoded file
   *    - 'transcoder:error': (err) triggered whenever an error occurs.
   */
  transcode (fileHash, options) {
    let defaults = {
      author: '0x', // ETH/PTI address of the file owner
      transcoder: this._defaultTranscoder
    }
    console.log('Signaling transoder...')

    let opts = dopts(options, defaults, {allowUnknown: true})
    let ev
    if (opts.ev) {
      ev = opts.ev
    } else {
      ev = new EventEmitter()
    }

    if (fileHash === '') {
      // empty hash for testing eventemitter
      ev.emit('transcoding:done', {test: 1})
      return ev
    }
    let msg = this._ipfs.protocol.createCommand('transcode', {hash: fileHash, author: opts.author})
    // FIXME : This is for dev, so we just signal our transcoder node.
    // This needs to be dynamic later on.
    this._node.swarm.connect(opts.transcoder, (err, success) => {
      if (err) return ev.emit('transcoding:error', err)

      this._node.swarm.peers((err, peers) => {
        console.log('peers: ', peers)
        if (err) return ev.emit('transcoding:error', err)
        peers.map((peer) => {
          console.log(`sending transcode msg to ${peer.peer.id.toB58String()} with request to transcode ${fileHash}`)
          this._ipfs.protocol.network.sendMessage(peer.peer.id, msg, (err) => {
            if (err) {
              ev.emit('transcoding:error', err)
              return ev
            }
          })

          if (peer.addr) {
          }
        })

        // paratii transcoder signal.
        this._ipfs.protocol.notifications.on('command', (peerId, command) => {
          console.log('paratii protocol: Got Command ', command.payload.toString(), 'args: ', command.args.toString())
          let commandStr = command.payload.toString()
          let argsObj
          try {
            argsObj = JSON.parse(command.args.toString())
          } catch (e) {
            console.log('couldn\'t parse args, ', command.args.toString())
          }

          switch (commandStr) {
            case 'transcoding:error':
              ev.emit('transcoding:error', argsObj.err)
              break
            case 'transcoding:started':
              ev.emit('transcoding:started', argsObj.hash, argsObj.author)
              break
            case 'transcoding:progress':
              ev.emit('transcoding:progress', argsObj.hash, argsObj.size, argsObj.percent)
              break
            case 'transcoding:downsample:ready':
              ev.emit('transcoding:downsample:ready', argsObj.hash, argsObj.size)
              break
            case 'transcoding:done':
              let result = JSON.parse(argsObj.result.toString())
              ev.emit('transcoding:done', argsObj.hash, result)
              break
            default:
              console.log('unknown command : ', commandStr)
          }
        })

        // ev.emit('transcoder:progress', 0) // TODO : add an event for starting.
      })
    })
    return ev
  }

  /**
   * convenience method for adding and transcoding files
   * @param {Array} files Array of HTML5 File Objects
   */
  addAndTranscode (files) {
    let ev = this.add(files)
    // ev.on('done', this._signalTranscoder.bind(this))
    ev.on('done', (files) => {
      this._signalTranscoder(files, ev)
    })
    // return the EventEmitter
    return ev
  }

  _signalTranscoder (files, ev) {
    let file
    if (Array.isArray(files)) {
      if (files.length < 1) {
        // console.log('_signalTranscoder Got an empty Array. files: ', files)
        // return
        //
        // FIXME THIS NEEDS TO BE REMOVED --------------------------------------
        file = {hash: ''} // testing something ...
        // ---------------------------------------------------------------------
      } else {
        file = files[0]
      }
    } else {
      file = files
    }

    if (!ev) {
      ev = new EventEmitter()
    }

    this.transcode(file.hash, {
      author: '0x', // author address,
      // onDone: (err, folderHash) => {
      //   if (err) throw err
      //   console.log('transcoder done ', folderHash)
      // },
      ev: ev
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
  //
  // _signalTranscoderPull (callback) {
  //   return pull.collect((err, res) => {
  //     if (err) {
  //       return callback(err)
  //     }
  //     const file = res[0]
  //     console.log('Adding %s finished', file.path)
  //
  //     // statusEl.innerHTML += `Added ${file.path} as ${file.hash} ` + '<br>'
  //     // Trigger paratii transcoder signal
  //     this.signalTrancoder(file, callback)
  //   })
  // }
  //
  // signalTranscoder (file, callback) {
  //   let msg = this._ipfs.protocol.createCommand('transcode', {hash: file.hash, author: this.id.id})
  //   this._node.swarm.connect('/dns4/bootstrap.paratii.video/tcp/443/wss/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW', (err, success) => {
  //     if (err) throw err
  //     this._node.swarm.peers((err, peers) => {
  //       console.log('peers: ', peers)
  //       if (err) throw err
  //       peers.map((peer) => {
  //         console.log('sending transcode msg to ', peer.peer.id.toB58String())
  //         this._ipfs.protocol.network.sendMessage(peer.peer.id, msg, (err) => {
  //           if (err) console.warn('[Paratii-protocol] Error ', err)
  //         })
  //
  //         if (peer.addr) {
  //         }
  //       })
  //       callback(null, file)
  //     })
  //   })
  //     // paratii transcoder signal.
  //   this._ipfs.protocol.notifications.on('command', (peerId, command) => {
  //     console.log('paratii protocol: Got Command ', command)
  //     if (command.payload.toString() === 'transcoding:done') {
  //       let args = JSON.parse(command.args.toString())
  //       let result = JSON.parse(args.result)
  //       console.log('args: ', args)
  //       console.log('result: ', result)
  //         // statusEl.innerHTML += `Video HLS link: /ipfs/${result.master.hash}\n`
  //
  //         // titleEl = document.querySelector('#input-title')
  //         // console.log('titleEl: ', titleEl)
  //       //   Meteor.call('videos.create', {
  //       //     id: String(Math.random()).split('.')[1],
  //       //     title: titleEl.value,
  //       //     price: 0.0,
  //       //     src: '/ipfs/' + result.master.hash,
  //       //     mimetype: 'video/mp4',
  //       //     stats: {
  //       //       likes: 0,
  //       //       dislikes: 0
  //       //     }}, (err, videoId) => {
  //       //       if (err) throw err
  //       //       console.log('[upload] Video Uploaded: ', videoId)
  //       //       statusEl.innerHTML += '\n Video Uploaded go to <b><a href="/play/' + videoId + '">/play/' + videoId + '</a></b>\n'
  //       //     })
  //     }
  //   })
  // }
}

module.exports = Uploader
