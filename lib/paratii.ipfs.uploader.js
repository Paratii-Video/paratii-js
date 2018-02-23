/* global File, ArrayBuffer */
'use strict'

/**
 * @module IPFS UPLOADER : Paratii IPFS uploader interface.
 */

const { EventEmitter } = require('events')
const joi = require('joi')
const pull = require('pull-stream')
const pullFilereader = require('pull-filereader')
const toPull = require('stream-to-pull-stream')
const fs = require('fs')
const path = require('path')
const { eachSeries, nextTick } = require('async')
const once = require('once')
const Multiaddr = require('multiaddr')

// const ytdl = require('ytdl-core')
// const vidl = require('vimeo-downloader')
// const readline = require('readline')

class Uploader extends EventEmitter {
  constructor (paratiiIPFS, opts) {
    super()
    this.setOptions(opts)
    this._ipfs = paratiiIPFS // this is the paratii.ipfs.js
    // this._ipfs.log('========================browser-uploader=====================')
  }

  setOptions (opts = {}) {
    // if (!opts || !opts.node) {
    //   throw new Error('IPFS Instance is required By Uploader.')
    // }
    this._node = opts.node // this is the actual IPFS node.
    this._chunkSize = opts.chunkSize || 100 * 1024
    this._defaultTranscoder = opts.defaultTranscoder || '/dns4/bootstrap.paratii.video/tcp/443/wss/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW' // Address of transcoder '/ip4/127.0.0.1/tcp/4003/ws/ipfs/Qmbd5jx8YF1QLhvwfLbCTWXGyZLyEJHrPbtbpRESvYs4FS'
     // '/dns4/bootstrap.paratii.video/tcp/443/wss/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW' // Address of transcoder
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
          this._ipfs.log('Adding ', file)
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
            this._ipfs.log('Adding %s finished as %s, size: %s', file.path, file.hash, file.size)
            ev.emit('fileReady', file)
            cb(null, file)
          })
        )),
        pull.collect((err, files) => {
          if (err) {
            ev.emit('error', err)
          }
          this._ipfs.log('uploader is DONE')
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
      // this._ipfs.log('adding ', dirPath, ' to IPFS')

      const addStream = this._node.files.addReadableStream()
      addStream.on('data', (file) => {
        // this._ipfs.log('dirPath ', dirPath)
        // this._ipfs.log('file Added ', file)
        if (file.path === dirPath) {
          // this._ipfs.log('this is the hash to return ')
          resp = file
          nextTick(() => resolve(resp))
        }
      })

      addStream.on('end', () => {
        // this._ipfs.log('addStream ended')
        // nextTick(() => cb(null, resp))
      })

      fs.readdir(dirPath, (err, files) => {
        if (err) return reject(err)
        eachSeries(files, (file, next) => {
          next = once(next)
          try {
            this._ipfs.log('reading file ', file)
            let rStream = fs.createReadStream(path.join(dirPath, file))
            rStream.on('error', (err) => {
              if (err) {
                this._ipfs.error('rStream Error ', err)
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
              this._ipfs.error('createReadStream Error: ', e)
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
   *    - 'uploader:progress': (hash, chunkSize, percent) client to transcoder upload progress.
   *    - 'transcoding:started': (hash, author)
   *    - 'transcoding:progress': (hash, size, percent)
   *    - 'transcoding:downsample:ready' (hash, size)
   *    - 'transcoding:done': (hash, transcoderResult) triggered when the transcoder is done - returns the hash of the transcoded file
   *    - 'transcoder:error': (err) triggered whenever an error occurs.
   */
  transcode (fileHash, options) {
    const schema = joi.object({
      author: joi.string().default('0x'), // ETH/PTI address of the file owner
      transcoder: joi.string().default(this._defaultTranscoder),
      transcoderId: joi.any().default(Multiaddr(this._defaultTranscoder).getPeerId())
    }).unknown()

    this._ipfs.log('Signaling transcoder...')

    const result = joi.validate(options, schema)
    const error = result.error
    if (error) throw error
    let opts = result.value

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
    let msg = this._ipfs.protocol.createCommand('transcode', {hash: fileHash, author: opts.author, size: opts.size})
    // FIXME : This is for dev, so we just signal our transcoder node.
    // This needs to be dynamic later on.
    this._node.swarm.connect(opts.transcoder, (err, success) => {
      if (err) return ev.emit('transcoding:error', err)

      opts.transcoderId = opts.transcoderId || Multiaddr(opts.transcoder).getPeerId()
      this._ipfs.log('transcoderId: ', opts.transcoderId)
      this._node.swarm.peers((err, peers) => {
        this._ipfs.log('peers: ', peers)
        if (err) return ev.emit('transcoding:error', err)
        peers.map((peer) => {
          this._ipfs.log('peerID : ', peer.peer.id.toB58String(), opts.transcoderId, peer.peer.id.toB58String() === opts.transcoder)
          if (peer.peer.id.toB58String() === opts.transcoderId) {
            this._ipfs.log(`sending transcode msg to ${peer.peer.id.toB58String()} with request to transcode ${fileHash}`)
            this._ipfs.protocol.network.sendMessage(peer.peer.id, msg, (err) => {
              if (err) {
                ev.emit('transcoding:error', err)
                return ev
              }
            })
          }
        })

        // paratii transcoder signal.
        this._ipfs.on('protocol:incoming', this._transcoderRespHander(ev, fileHash))
        // ev.emit('transcoder:progress', 0) // TODO : add an event for starting.
      })
    })
    return ev
  }

  /**
   * handles responses from the paratii-protocol in case of transcoding.
   * @param  {EventEmitter} ev the transcoding job EventEmitter
   * @return {function}    returns various events based on transcoder response.
   */
  _transcoderRespHander (ev, fileHash) {
    return (peerId, command) => {
      this._ipfs.log('paratii protocol: Got Command ', command.payload.toString(), 'args: ', command.args.toString())
      let commandStr = command.payload.toString()
      let argsObj
      try {
        argsObj = JSON.parse(command.args.toString())
      } catch (e) {
        this._ipfs.error('couldn\'t parse args, ', command.args.toString())
      }

      switch (commandStr) {
        case 'transcoding:error':
          console.log('DEBUG TRANSCODER ERROR: fileHash: ', fileHash, ' , errHash: ', argsObj.hash)
          if (argsObj.hash === fileHash) {
            ev.emit('transcoding:error', argsObj.err)
          }
          break
        case 'transcoding:started':
          ev.emit('transcoding:started', argsObj.hash, argsObj.author)
          break
        case 'transcoding:progress':
          ev.emit('transcoding:progress', argsObj.hash, argsObj.size, argsObj.percent)
          break
        case 'uploader:progress':
          ev.emit('uploader:progress', argsObj.hash, argsObj.chunkSize, argsObj.percent)
          break
        case 'transcoding:downsample:ready':
          ev.emit('transcoding:downsample:ready', argsObj.hash, argsObj.size)
          break
        case 'transcoding:done':
          let result = JSON.parse(argsObj.result.toString())
          ev.emit('transcoding:done', argsObj.hash, result)
          break
        default:
          this._ipfs.log('unknown command : ', commandStr)
      }
    }
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
        // this._ipfs.log('_signalTranscoder Got an empty Array. files: ', files)
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
      //   this._ipfs.log('transcoder done ', folderHash)
      // },
      ev: ev
    })
  }

  getMetaData (fileHash, options) {
    return new Promise((resolve, reject) => {
      const schema = joi.object({
        transcoder: joi.string().default(this._defaultTranscoder),
        transcoderId: joi.any().default(Multiaddr(this._defaultTranscoder).getPeerId())
      }).unknown()

      this._ipfs.log('Signaling transcoder getMetaData...')
      const result = joi.validate(options, schema)
      const error = result.error
      if (error) reject(error)
      let opts = result.value
      console.log('opts: ', opts)
      let ev
      if (opts.ev) {
        ev = opts.ev
      } else {
        ev = new EventEmitter()
      }
      this._ipfs.start(() => {
        let msg = this._ipfs.protocol.createCommand('getMetaData', {hash: fileHash})
        // FIXME : This is for dev, so we just signal our transcoder node.
        // This needs to be dynamic later on.
        this._ipfs.ipfs.swarm.connect(opts.transcoder, (err, success) => {
          if (err) return reject(err)

          opts.transcoderId = opts.transcoderId || Multiaddr(opts.transcoder).getPeerId()
          this._ipfs.log('transcoderId: ', opts.transcoderId)
          this._node.swarm.peers((err, peers) => {
            this._ipfs.log('peers: ', peers)
            if (err) return reject(err)

            peers.map((peer) => {
              this._ipfs.log('peerID : ', peer.peer.id.toB58String(), opts.transcoderId, peer.peer.id.toB58String() === opts.transcoder)
              if (peer.peer.id.toB58String() === opts.transcoderId) {
                this._ipfs.log(`sending getMetaData msg to ${peer.peer.id.toB58String()} with request to transcode ${fileHash}`)
                this._ipfs.protocol.network.sendMessage(peer.peer.id, msg, (err) => {
                  if (err) {
                    ev.emit('getMetaData:error', err)
                    return ev
                  }
                })
              }
            })

            // paratii getMetaData signal.
            this._ipfs.on('protocol:incoming', (peerId, command) => {
              this._ipfs.log('paratii protocol: Got Command ', command.payload.toString(), 'args: ', command.args.toString())
              let commandStr = command.payload.toString()
              let argsObj
              try {
                argsObj = JSON.parse(command.args.toString())
              } catch (e) {
                this._ipfs.error('couldn\'t parse args, ', command.args.toString())
              }

              switch (commandStr) {
                case 'getMetaData:error':
                  if (argsObj.hash === fileHash) {
                    console.log('DEBUG getMetaData ERROR: fileHash: ', fileHash, ' , errHash: ', argsObj.hash)
                    reject(argsObj.err)
                  }
                  break
                case 'getMetaData:done':
                  if (argsObj.hash === fileHash) {
                    console.log('data: ', argsObj.data)
                    let result = argsObj.data
                    resolve(result)
                  }
                  break
                default:
                  this._ipfs.log('unknown command : ', commandStr)
              }
            })
            // ev.emit('transcoder:progress', 0) // TODO : add an event for starting.
          })
        })
      })
    })
  }

  pinFile (fileHash, options) {
    if (options === undefined) options = {}

    const schema = joi.object({
      author: joi.string().default('0x'), // ETH/PTI address of the file owner
      transcoder: joi.string().default(this._defaultTranscoder),
      size: joi.number().default(0)
    }).unknown()

    this._ipfs.log('Signaling transcoder...')

    const result = joi.validate(options, schema)
    const error = result.error
    if (error) throw error
    let opts = result.value

    let ev
    if (opts.ev) {
      ev = opts.ev
    } else {
      ev = new EventEmitter()
    }

    let msg = this._ipfs.protocol.createCommand('pin', {hash: fileHash, author: opts.author, size: opts.size})
    // FIXME : This is for dev, so we just signal our transcoder node.
    // This needs to be dynamic later on.
    this._node.swarm.connect(opts.transcoder, (err, success) => {
      if (err) return ev.emit('pin:error', err)

      this._node.swarm.peers((err, peers) => {
        this._ipfs.log('peers: ', peers)
        if (err) return ev.emit('pin:error', err)
        peers.map((peer) => {
          this._ipfs.log(`sending pin msg to ${peer.peer.id.toB58String()} with request to pin ${fileHash}`)
          this._ipfs.protocol.network.sendMessage(peer.peer.id, msg, (err) => {
            if (err) {
              ev.emit('pin:error', err)
              return ev
            }
          })
        })

        // paratii pinning response.
        this._ipfs.on('protocol:incoming', this._pinResponseHandler(ev))
      })
    })

    return ev
  }

  _pinResponseHandler (ev) {
    return (peerId, command) => {
      this._ipfs.log('paratii protocol: Got Command ', command.payload.toString(), 'args: ', command.args.toString())
      let commandStr = command.payload.toString()
      let argsObj
      try {
        argsObj = JSON.parse(command.args.toString())
      } catch (e) {
        this._ipfs.log('couldn\'t parse args, ', command.args.toString())
      }

      switch (commandStr) {
        case 'pin:error':
          ev.emit('pin:error', argsObj.err)
          break
        case 'pin:progress':
          ev.emit('pin:progress', argsObj.hash, argsObj.chunkSize, argsObj.percent)
          break
        case 'pin:done':
          ev.emit('pin:done', argsObj.hash)
          break
        default:
          this._ipfs.log('unknown command : ', commandStr)
      }
    }
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
  // _signalTranscoderPull (callback) {
  //   return pull.collect((err, res) => {
  //     if (err) {
  //       return callback(err)
  //     }
  //     const file = res[0]
  //     this._ipfs.log('Adding %s finished', file.path)
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
  //       this._ipfs.log('peers: ', peers)
  //       if (err) throw err
  //       peers.map((peer) => {
  //         this._ipfs.log('sending transcode msg to ', peer.peer.id.toB58String())
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
  //     this._ipfs.log('paratii protocol: Got Command ', command)
  //     if (command.payload.toString() === 'transcoding:done') {
  //       let args = JSON.parse(command.args.toString())
  //       let result = JSON.parse(args.result)
  //       this._ipfs.log('args: ', args)
  //       this._ipfs.log('result: ', result)
  //         // statusEl.innerHTML += `Video HLS link: /ipfs/${result.master.hash}\n`
  //
  //         // titleEl = document.querySelector('#input-title')
  //         // this._ipfs.log('titleEl: ', titleEl)
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
  //       //       this._ipfs.log('[upload] Video Uploaded: ', videoId)
  //       //       statusEl.innerHTML += '\n Video Uploaded go to <b><a href="/play/' + videoId + '">/play/' + videoId + '</a></b>\n'
  //       //     })
  //     }
  //   })
  // }
}

module.exports = Uploader
