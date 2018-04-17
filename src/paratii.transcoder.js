/* global ArrayBuffer */
'use strict'

import { ipfsSchema } from './schemas.js'
import { EventEmitter } from 'events'
import joi from 'joi'
const Multiaddr = require('multiaddr')

/**
 * contains functions to interact with the transcoder
 * @extends EventEmitter
 * @param {ParatiiIPFSTranscoderSchema} opts
 */
export class ParatiiTranscoder extends EventEmitter {
  /**
  * @typedef {Array} ParatiiIPFSTranscoderSchema
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
    this._node = this._ipfs.ipfs
    // console.log('this._ipfs:', this._ipfs)
  }

  /**
   * signals transcoder(s) to transcode fileHash
   * @param  {string} fileHash IPFS file hash.
   * @param  {Object} options  ref: https://github.com/Paratii-Video/paratii-js/blob/master/docs/paratii-ipfs.md#ipfsuploadertranscodefilehash-options
   * @return {EvenEmitter} EventEmitter with the following events:<br>
   *    - 'uploader:progress': (hash, chunkSize, percent) client to transcoder upload progress.<br>
   *    - 'transcoding:started': (hash, author)<br>
   *    - 'transcoding:progress': (hash, size, percent)<br>
   *    - 'transcoding:downsample:ready' (hash, size)<br>
   *    - 'transcoding:done': (hash, transcoderResult) triggered when the transcoder is done - returns the hash of the transcoded file<br>
   *    - 'transcoder:error': (err) triggered whenever an error occurs.<br>
   */
  transcode (fileHash, options) {
    const schema = joi.object({
      author: joi.string().default('0x'), // ETH/PTI address of the file owner
      transcoder: joi.string().default(this.config.ipfs.defaultTranscoder),
      transcoderId: joi.any().default(Multiaddr(this.config.ipfs.defaultTranscoder).getPeerId())
    }).unknown()

    this._ipfs.log('Signaling transcoder...', fileHash)

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
    let msg = this._ipfs.protocol.createCommand('transcode', {
      hash: fileHash, author: opts.author, size: opts.size
    })
    // FIXME : This is for dev, so we just signal our transcoder node.
    // This needs to be dynamic later on.
    this._ipfs.getIPFSInstance().then((_ipfs) => {
      this._node = _ipfs
      this._node.swarm.connect(opts.transcoder, (err, success) => {
        if (err) return ev.emit('transcoding:error', err)

        opts.transcoderId = opts.transcoderId || Multiaddr(opts.transcoder).getPeerId()
        this._ipfs.log('transcoderId: ', opts.transcoderId)
        this._node.swarm.peers((err, peers) => {
          this._ipfs.log('peers: ', peers)
          if (err) return ev.emit('transcoding:error', err)
          peers.map((peer) => {
            try {
              this._ipfs.log('peerID : ', peer.peer.toB58String(), opts.transcoderId, peer.peer.toB58String() === opts.transcoder)
              if (peer.peer.toB58String() === opts.transcoderId) {
                this._ipfs.log(`sending transcode msg to ${peer.peer.toB58String()} with request to transcode ${fileHash}`)
                this._ipfs.protocol.network.sendMessage(peer.peer, msg, (err) => {
                  if (err) {
                    ev.emit('transcoding:error', err)
                    return ev
                  }
                })
              }
            } catch (e) {
              console.log('PEER ERROR :', e, peer)
            }
          })

          // paratii transcoder signal.
          this._ipfs.on('protocol:incoming', this._transcoderRespHander(ev, fileHash))
        })
      })
    })
    return ev
  }

  // TODO add example
  /**
   * handles responses from the paratii-protocol in case of transcoding.
   * @param  {EventEmitter} ev the transcoding job EventEmitter
   * @return {function}    returns various events based on transcoder response.
   * @example ?
   * @private
   */
  _transcoderRespHander (ev, fileHash) {
    return (peerId, command) => {
      this._ipfs.log('paratii protocol: Received command ', command.payload.toString(), 'args: ', command.args.toString())
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
            ev.emit('transcoding:error', argsObj)
          }
          break
        case 'transcoding:started':
          if (argsObj.hash === fileHash) {
            ev.emit('transcoding:started', argsObj.hash, argsObj.author)
          }
          break
        case 'transcoding:progress':
          if (argsObj.hash === fileHash) {
            ev.emit('transcoding:progress', argsObj.hash, argsObj.size, argsObj.percent)
          }
          break
        case 'uploader:progress':
          if (argsObj.hash === fileHash) {
            ev.emit('uploader:progress', argsObj.hash, argsObj.chunkSize, argsObj.percent)
          }
          break
        case 'transcoding:downsample:ready':
          if (argsObj.hash === fileHash) {
            ev.emit('transcoding:downsample:ready', argsObj.hash, argsObj.size)
          }
          break
        case 'transcoding:done':
          if (argsObj.hash === fileHash) {
            let result = JSON.parse(argsObj.result.toString())
            ev.emit('transcoding:done', argsObj.hash, result)
          }
          break
        default:
          if (argsObj.hash === fileHash) {
            this._ipfs.log('unknown command : ', commandStr)
          }
      }
    }
  }

  /**
   * See {@link ParatiiCoreVids#uploadAndTranscode}
   */
  uploadAndTranscode (files) {
    let ev = this._ipfs.local.add(files)
    ev.on('done', (files) => {
      this._signalTranscoder(files, ev)
    })
    return ev
  }

  // TODO add docs
  /**
   * [_signalTranscoder description]
   * @param  {Object} files [description]
   * @param  {Object} ev    [description]
   * @return {Object}       [description]
   * @example ?
   * @private
   */
  _signalTranscoder (files, ev) {
    let file
    if (Array.isArray(files)) {
      if (files.length < 1) {
        // FIXME THIS NEEDS TO BE REMOVED
        file = {hash: ''} // testing something ...
        // this._ipfs.log('_signalTranscoder Got an empty Array. files: ', files)
        // return
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
      ev: ev
    })
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
