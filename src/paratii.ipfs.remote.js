/* global ArrayBuffer */
'use strict'
import { ipfsSchema } from './schemas.js'
import { EventEmitter } from 'events'
import joi from 'joi'
const Resumable = require('resumablejs')
const Multiaddr = require('multiaddr')

/**
 * IPFS UPLOADER : Paratii IPFS uploader interface.
 * @extends EventEmitter
 * @param {ParatiiIPFSUploaderSchema} opts
 */
export class ParatiiIPFSRemote extends EventEmitter {
  /**
  * @typedef {Array} ParatiiIPFSUploaderSchema
  * @property {?ipfsSchema} ipfs
  * @property {?Object} ParatiiIPFS
  */
  constructor (opts) {
    super()
    const schema = joi.object({
      ipfs: ipfsSchema,
      paratiiIPFS: joi.object().optional()
    //   onReadyHook: joi.array().ordered().default([]),
    //   protocol: joi.string().default(null),
    })
    const result = joi.validate(opts, schema, {allowUnknown: true})
    if (result.error) throw result.error
    this.config = result.value
    this._ipfs = this.config.paratiiIPFS // this is the paratii.ipfs.js
  }

  /**
    * Upload a file over XHR to the transcoder. To be called with an event emitter as the last argument
    * @param  {Object} file file to upload
    * @param  {string} hash IPFS multi-hash of the file
    * @param  {?EventEmitter} ev optional event emitter
    * @example this.xhrUpload(file, hashedFile)

    */
  xhrUpload (file, hash, ev) {
    if (!ev) {
      ev = new EventEmitter()
    }
    let r = new Resumable({
      target: `${this.config.ipfs.transcoderDropUrl}/${hash}`,
      chunkSize: this.config.ipfs.xhrChunkSize,
      simultaneousUploads: 4,
      testChunks: false,
      throttleProgressCallbacks: 1,
      maxFileSize: this.config.ipfs.maxFileSize
    })

    r.on('fileAdded', (file, ev) => {
      console.log('file ', file, 'added')
    })

    r.on('fileProgress', (file) => {
      ev.emit('progress', r.progress() * 100)
    })

    r.on('complete', () => {
      ev.emit('fileReady', file)
    })

    r.on('error', (err, file) => {
      console.error('file ', file, 'err ', err)
    })

    r.addFile(file._html5File)

    setTimeout(() => {
      r.upload()
    }, 1)
  }

  /**
   * [getMetaData description]
   * @param  {Object} fileHash [description]
   * @param  {Object} options  [description]
   * @return {Object}          [description]
   * @private
   */
  getMetaData (fileHash, options) {
    return new Promise((resolve, reject) => {
      const schema = joi.object({
        transcoder: joi.string().default(this.config.ipfs.defaultTranscoder),
        transcoderId: joi.any().default(Multiaddr(this.config.ipfs.defaultTranscoder).getPeerId())
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
      this._ipfs.start().then(() => {
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
              this._ipfs.log('paratii protocol: Received command ', command.payload.toString(), 'args: ', command.args.toString())
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
          })
        })
      })
    })
  }
  /**
   * Signal the remote node to pin a File
   * @param  {Object} fileHash hash of the file to pin
   * @param  {Object} options  [description]
   * @return {Promise}  a Promise/EventEmitter that resolves inthe hash of the pinned file
   * @example paratii.ipfs.remote.pinFile('QmQP5SJzEBKy1uAGASDfEPqeFJ3HUbEp4eZzxvTLdZZYwB')
   */
  pinFile (fileHash, options) {
    if (options === undefined) {
      options = {}
    }

    const schema = joi.object({
      author: joi.string().default('0x'), // ETH/PTI address of the file owner
      transcoder: joi.string().default(this.config.ipfs.defaultTranscoder),
      transcoderId: joi.any().default(Multiaddr(this.config.ipfs.defaultTranscoder).getPeerId()),
      size: joi.number().default(0)
    }).unknown()

    this._ipfs.log(`Signaling transcoder to pin ${fileHash}`)

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
          try {
            this._ipfs.log('peer.peer.toB58String(): ', peer.peer.toB58String())
            if (peer.peer.toB58String() === opts.transcoderId) {
              this._ipfs.log(`sending pin msg to ${peer.peer._idB58String} with request to pin ${fileHash}`)
              this._ipfs.protocol.network.sendMessage(peer.peer, msg, (err) => {
                if (err) {
                  ev.emit('pin:error', err)
                  console.log(err)
                  return ev
                }
              })
            }
          } catch (e) {
            console.log('PEER ERROR :', e, peer)
          }
        })

        // paratii pinning response.
        this._ipfs.on('protocol:incoming', this._pinResponseHandler(ev))
      })
    })

    return ev
  }
  /**
   * [_pinResponseHandler description]
   * @param  {Object} ev [description]
   * @return {Object}    [description]
   * @private
   */
  _pinResponseHandler (ev) {
    return (peerId, command) => {
      this._ipfs.log('paratii protocol: Received command ', command.payload.toString(), 'args: ', command.args.toString())
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
}
