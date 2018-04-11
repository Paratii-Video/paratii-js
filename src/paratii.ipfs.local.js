/* global File, ArrayBuffer */
'use strict'

import { ipfsSchema } from './schemas.js'
import { EventEmitter } from 'events'
import joi from 'joi'
const pull = require('pull-stream')
const pullFilereader = require('pull-filereader')
const toPull = require('stream-to-pull-stream')
const fs = require('fs')
const path = require('path')
const { eachSeries, nextTick } = require('async')
const once = require('once')
const Multiaddr = require('multiaddr')
const Resumable = require('resumablejs')

/**
 * IPFS UPLOADER : Paratii IPFS uploader interface.
 * @extends EventEmitter
 * @param {ParatiiIPFSUploaderSchema} opts
 */
export class ParatiiIPFSLocal extends EventEmitter {
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
   * Adds the file to ipfs
   * @param  {ReadStream}  fileStream ReadStream of the file. Can be created with fs.createReadStream(path)
   * @return {Promise}            data about the added file (path,multihash,size)
   * @example
   * let path = 'test/data/some-file.txt'
   * let fileStream = fs.createReadStream(path)
   * let result = await paratiiIPFS.add(fileStream)
   */
  async add (fileStream) {
    let ipfs = await this.getIPFSInstance()
    return ipfs.files.add(fileStream)
  }
  /**
   * upload an entire directory to IPFS
   * @param  {string}   dirPath path to directory
   * @return {Promise}           returns the {multihash, path, size} for the uploaded folder.
   * @example ?

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
  * gets a JSON object stored in IPFS
  * @param  {string}  multihash ipfs multihash of the object
  * @return {Promise}           requested Object
  * @example let jsonObj = await paratii.ipfs.getJSON('some-multihash')
  */
  async getJSON (multihash) {
    let ipfs = await this.getIPFSInstance()
    let node
    try {
      node = await ipfs.files.cat(multihash)
    } catch (e) {
      if (e) throw e
    }

    return JSON.parse(node.toString())
  }

  /**
   * Starts the IPFS node
   * @return {Promise} that resolves in an IPFS instance
   * @example paratii.ipfs.start()
   */
  start () {
    return new Promise((resolve, reject) => {
      if (this.ipfs && this.ipfs.isOnline()) {
        console.log('IPFS is already running')
        return resolve(this.ipfs)
      }

      this.getIPFSInstance().then(function (ipfs) {
        resolve(ipfs)
      })
    })
  }

  /**
   * Stops the IPFS node.
   * @example paratii.ipfs.stop()
   */
  stop () {
    return new Promise((resolve, reject) => {
      if (!this.ipfs || !this.ipfs.isOnline()) {
        resolve()
      }
      if (this.ipfs) {
        this.ipfs.stop(() => {
          setImmediate(() => {
            resolve()
          })
        })
      }
    })
  }

  /**
   * get an ipfs instance of jsipfs. Singleton pattern
   * @return {Object} Ipfs instance
   * @example ipfs = await paratii.ipfs.getIPFSInstance()
   */
  getIPFSInstance () {
    return new Promise((resolve, reject) => {
      if (this.ipfs) {
        resolve(this.ipfs)
      } else {
        let config = this.config
        // there will be no joi in IPFS (pun indended)
        import(/* webpackChunkName: 'ipfs' */ 'ipfs') // eslint-disable-line
        .then((Ipfs) => {
          let ipfs = new Ipfs({
            bitswap: {
              // maxMessageSize: 256 * 1024
              maxMessageSize: this.config.ipfs['bitswap.maxMessageSize']
            },
            start: true,
            repo: config.ipfs.repo || '/tmp/test-repo-' + String(Math.random()),
            config: {
              Addresses: {
                Swarm: this.config.ipfs.swarm
                // [
                //   '/dns4/star.paratii.video/tcp/443/wss/p2p-webrtc-star',
                //   '/dns4/ws.star.paratii.video/tcp/443/wss/p2p-websocket-star/'
                // ]
              },
              Bootstrap: this.config.ipfs.bootstrap
              // [
              //   '/dns4/bootstrap.paratii.video/tcp/443/wss/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW'
              // ]
            }
          })

          this.ipfs = ipfs

          ipfs.on('ready', () => {
            this.log('[IPFS] node Ready.')

            ipfs._bitswap.notifications.on('receivedNewBlock', (peerId, block) => {
              this.log('[IPFS] receivedNewBlock | peer: ', peerId.toB58String(), ' block length: ', block.data.length)
              this.log('---------[IPFS] bitswap LedgerMap ---------------------')
              ipfs._bitswap.engine.ledgerMap.forEach((ledger, peerId, ledgerMap) => {
                this.log(`${peerId} : ${JSON.stringify(ledger.accounting)}\n`)
              })
              this.log('-------------------------------------------------------')
            })

            ipfs.id().then((id) => {
              let peerInfo = id
              this.id = id
              this.log(`[IPFS] id:  ${peerInfo}`)
              let ptiAddress = this.config.account.address || 'no_address'
              this.protocol = new Protocol(
                ipfs._libp2pNode,
                ipfs._repo.blocks,
                // add ETH Address here.
                ptiAddress
              )

              this.remote._node = ipfs
              this.local._node = ipfs
              this.transcoder._node = ipfs

              this.protocol.notifications.on('message:new', (peerId, msg) => {
                this.log('[paratii-protocol] ', peerId.toB58String(), ' new Msg: ', msg)
              })
              // emit all commands.
              // NOTE : this will be changed once protocol upgrades are ready.
              this.protocol.notifications.on('command', (peerId, command) => {
                this.emit('protocol:incoming', peerId, command)
              })

              this.ipfs = ipfs
              this.protocol.start(() => {
                setTimeout(() => {
                  resolve(ipfs)
                }, 10)
              })
            })
          })

          ipfs.on('error', (err) => {
            if (err) {
              // this.log('IPFS node ', ipfs)
              this.error('[IPFS] Error ', err)
              reject(err)
            }
          })
        })
      }
    })
  }
  /**
   * adds a data Object to the IPFS local instance
   * @param  {Object}  data JSON object to store
   * @return {Promise}      promise with the ipfs multihash
   * @example let result = await paratiiIPFS.addJSON(data)
   */
  async addJSON (data) {
    let ipfs = await this.getIPFSInstance()
    // if (!this.ipfs || !this.ipfs.isOnline()) {
    //   throw new Error('IPFS node is not ready, please trigger getIPFSInstance first')
    // }
    const obj = {
      Data: Buffer.from(JSON.stringify(data)),
      Links: []
    }
    let node
    try {
      // node = await ipfs.object.put(obj)
      node = await ipfs.files.add(obj.Data)
    } catch (e) {
      if (e) throw e
    }

    return node[0].hash
  }
  /**
   * log messages on the console if verbose is set
   * @param  {string} msg text to log
   * @example
   * paratii.ipfs.log("some-text")
   */
  log (...msg) {
    if (this.config.verbose) {
      console.log(...msg)
    }
  }
  /**
   * log warns on the console if verbose is set
   * @param  {string} msg warn text
   * @example
   * paratii.ipfs.warn("some-text")
   */
  warn (...msg) {
    if (this.config.verbose) {
      console.warn(...msg)
    }
  }
  /**
  * log errors on the console if verbose is set
  * @param  {string} msg error message
  * @example
  * paratii.ipfs.error("some-text")
  */
  error (...msg) {
    if (this.config.verbose) {
      console.error(...msg)
    }
  }

}
