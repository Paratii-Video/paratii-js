/* global ArrayBuffer */
'use strict'
import { ipfsSchema } from './schemas.js'
import { EventEmitter } from 'events'
import joi from 'joi'
const Resumable = require('resumablejs')
const Multiaddr = require('multiaddr')

// Needed to check the transcoder drop url status code
require('es6-promise').polyfill()
const fetch = require('isomorphic-fetch')
// Needed to open a socket connection
var net = require('net')

/**
 * Contains functions to interact with the remote IPFS node
 * @extends EventEmitter
 * @param {ParatiiIPFSRemoteSchema} opts
 */
export class ParatiiIPFSRemote extends EventEmitter {
  /**
  * @typedef {Array} ParatiiIPFSRemoteSchema
  * @property {ipfsSchema=} ipfs
  * @property {ParatiiIPFS} paratiiIPFS
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

  /*
   * Add a file to the local ipfs node and upload it over xhr to the remote node
   */
  addAndUpload (files, ev) {
    if (!ev) {
      ev = new EventEmitter()
    }
    ev = this._ipfs.local.upload(files, ev)
    ev.on('local:fileReady', function (file, hashedFile) {
      if (file._html5File) {
        this._ipfs.remote.xhrUpload(file, hashedFile, ev)
      } else {
        this._ipfs.remote.pinFile(hashedFile)
      }
    })
    return ev
  }

  /**
    * Upload a file over XHR to the transcoder. To be called with an event emitter as the last argument
    * @param  {Object} file file to upload
    * @param  {string} hash IPFS multi-hash of the file
    * @param  {?EventEmitter} ev optional event emitter
    * @example this.xhrUpload(file, hashedFile)
    */
  xhrUpload (file, hashedFile, ev) {
    if (!ev) {
      ev = new EventEmitter()
    }

    let r = new Resumable({
      target: `${this.config.ipfs.transcoderDropUrl}/${hashedFile.hash}`,
      chunkSize: this.config.ipfs.xhrChunkSize,
      simultaneousUploads: 4,
      testChunks: false,
      throttleProgressCallbacks: 1,
      maxFileSize: this.config.ipfs.maxFileSize
    })

    r.on('fileProgress', (file) => {
      ev.emit('progress', r.progress() * 100)
    })

    r.on('complete', () => {
      ev.emit('fileReady', hashedFile)
    })

    r.on('error', (err, file) => {
      console.error('file ', file, 'err ', err)
    })

    r.addFile(file._html5File)

    setTimeout(() => {
      r.upload()
    }, 1)
  }

  // TODO add getMetadata doc
  /**
   * [getMetaData description]
   * @param  {Object} fileHash ipfs multihash of the file
   * @param  {?Object} options  can contain transcoder, transcoder id and an event emitter
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

  // TODO add docs
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
  /**
   * Requests the transcoderDropUrl to see if it's up (Easily adds a dozen seconds to check the status)
   * @return {Promise} that resolves in a boolean
   */
  async checkTranscoderDropUrl () {
    return new Promise(resolve => {
      fetch(this.config.ipfs.transcoderDropUrl)
        .then(function (response) {
          if (response.status === 200) {
            resolve(true)
          } else {
            resolve(false)
          }
        })
    })
  }
  /**
   * Checks the bootstrap dns nodes
   * @param {string} baseUrl url of the web socket server
   * @param {Number} port the port at which the web socket is listening to
   * @return {Promise} that resolves in a boolean
   */
  async checkBootstrapWebSocketDNS (baseUrl, port) {
    return new Promise(resolve => {
      var client = new net.Socket()
      client.setTimeout(30000) // Arbitrary 30 secondes to be able to reach DNS server
      client.connect(port, baseUrl, () => {
        client.end()
        resolve(true)
      })
      client.on('error', (err) => {
        if (err) {
          client.end()
          resolve(false)
        } else {
          client.end()
          resolve(false)
        }
      })
      client.on('timeout', () => {
        client.end()
        resolve(false)
      })
    })
  }
  /**
   * Checks the default transcoder
   * @return {Promise} that resolves in a boolean
   */
  async checkDefaultTranscoder () {
    let splitDefaultTranscoder = this.config.ipfs.defaultTranscoder.split('/')
    let defaultTranscoderCheck = await this.checkBootstrapWebSocketDNS(splitDefaultTranscoder[2], splitDefaultTranscoder[4])
    return defaultTranscoderCheck
  }
  /**
   * Checks the remote IPFS node
   * @return {Promise} that resolves in a boolean
   */
  async checkRemoteIPFSNode () {
    let splitRemoteIPFSNode = this.config.ipfs.remoteIPFSNode.split('/')
    let remoteIPFSNodeCheck = await this.checkBootstrapWebSocketDNS(splitRemoteIPFSNode[2], splitRemoteIPFSNode[4])
    return remoteIPFSNodeCheck
  }
}
