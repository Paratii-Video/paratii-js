// import { paratiiIPFS } from './ipfs/index.js'
import Protocol from 'paratii-protocol'
global.Buffer = global.Buffer || require('buffer').Buffer

// const Ipfs = require('ipfs')
const joi = require('joi')
const Uploader = require('./paratii.ipfs.uploader.js')
const { EventEmitter } = require('events')
// var pull = require('pull-stream')
// var pullFilereader = require('pull-filereader')
const DEFAULT_REPO = '/tmp/paratii-ipfs-repo'
// const REPO_PATH = 'paratii-ipfs-repo'

/**
 * Contains functions to interact with the IPFS instance.
 * @param {Object} config configuration object to initialize Paratii object
 */
export class ParatiiIPFS extends EventEmitter {
  constructor (config) {
    super()
    const schema = joi.object({
      protocol: joi.string().default(null),
      onReadyHook: joi.array().ordered().default([]),
      'config.addresses.swarm': joi
        .array()
        .ordered(
            joi.string().default('/dns4/star.paratii.video/tcp/443/wss/p2p-webrtc-star'),
            joi.string().default('/dns/ws.star.paratii.video/wss/p2p-websocket-star/')
        ),
      'ipfs.config.Bootstrap': joi
      .array()
      .ordered(
          joi.string().default('/dns4/bootstrap.paratii.video/tcp/443/wss/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW')
      ),
      'ipfs.repo': joi.string().default(DEFAULT_REPO),
      'ipfs.bitswap.maxMessageSize': joi.number().default(128 * 1024),
      address: joi.string().default(null),
      verbose: joi.bool().default(true)
    }).unknown()

    const result = joi.validate(config, schema)
    const error = result.error
    if (error) throw error
    this.config = result.value
    this.uploader = new Uploader(this)
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
   * get file from ipfs
   * @param  {String}  hash multihash of the file
   * @return {Promise}      the file (path,content)
   * @example
   * let result = await paratiiIPFS.add(fileStream)
   * let hash = result[0].hash
   * let fileContent = await paratiiIPFS.get(hash)
   */
  async get (hash) {
    let ipfs = await this.getIPFSInstance()
    return ipfs.files.get(hash)
  }
  /**
   * log messages on the console if verbose is set
   * @param  {String} msg text to log
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
   * @param  {String} msg warn text
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
  * @param  {String} msg error message
  * @example
  * paratii.ipfs.error("some-text")
  */
  error (...msg) {
    if (this.config.verbose) {
      console.error(...msg)
    }
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
              maxMessageSize: 256 * 1024
            },
            start: true,
            repo: config['ipfs.repo'] || '/tmp/test-repo-' + String(Math.random()),
            config: {
              Addresses: {
                Swarm: [
                  '/dns4/star.paratii.video/tcp/443/wss/p2p-webrtc-star',
                  '/dns4/ws.star.paratii.video/tcp/443/wss/p2p-websocket-star/'
                ]
              },
              Bootstrap: [
                '/dns4/bootstrap.paratii.video/tcp/443/wss/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW'
              ]
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
              let ptiAddress = this.config.address || 'no_address'
              this.protocol = new Protocol(
                ipfs._libp2pNode,
                ipfs._repo.blocks,
                // add ETH Address here.
                ptiAddress
              )

              // uploader
              this.uploader.setOptions({
                node: ipfs,
                chunkSize: 128 * 1024
              })

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
   * convenient method to add JSON and send it for persistance storage.
   * @param  {object}  data JSON object to store
   * @return {string}      returns multihash of the stored object.
   * @example let result = await paratiiIPFS.addAndPinJSON(data)
   */
  async addAndPinJSON (data) {
    let hash = await this.addJSON(data)
    let pinFile = () => {
      let pinEv = this.uploader.pinFile(hash,
        { author: this.config.account.address }
      )
      pinEv.on('pin:error', (err) => {
        console.warn('pin:error:', hash, ' : ', err)
        pinEv.removeAllListeners()
      })
      pinEv.on('pin:done', (hash) => {
        console.log('pin:done:', hash)
        pinEv.removeAllListeners()
      })
      return pinEv
    }

    let pinEv = pinFile()

    pinEv.on('pin:error', (err) => {
      console.warn('pin:error:', hash, ' : ', err)
      console.log('trying again')
      pinEv = pinFile()
    })

    return hash
  }
  /**
  * gets a JSON object stored in IPFS
  * @param  {String}  multihash ipfs multihash of the object
  * @return {Promise}           requested Object
  * @example let jsonObj = await paratiiIPFS.getJSON('some-multihash')
  */
  async getJSON (multihash) {
    let ipfs = await this.getIPFSInstance()
    // if (!this.ipfs || !this.ipfs.isOnline()) {
    //   throw new Error('IPFS node is not ready, please trigger getIPFSInstance first')
    // }

    let node
    try {
      // node = await ipfs.object.get(multihash)
      node = await ipfs.files.cat(multihash)
    } catch (e) {
      if (e) throw e
    }

    return JSON.parse(node.toString())
  }
  /**
   * Starts the IPFS node
   * @param  {Function} callback callback function
   * @return {?}            DON'T KNOW?
   * @example ?
   */
  // TODO: return a promise
  start (callback) {
    // if (!window.Ipfs) {
    //   return callback(new Error('window.Ipfs is not available, call initIPFS first'))
    // }

    if (this.ipfs && this.ipfs.isOnline()) {
      console.log('IPFS is already running')
      return callback()
    }

    this.getIPFSInstance().then(function (ipfs) { callback() })
  }
  /**
   * Stops the IPFS node.
   * @param  {Function} callback callback function
   * @return {?}            DON'T KNOW?
   * @example ?
   */
  stop (callback) {
    if (!this.ipfs || !this.ipfs.isOnline()) {
      if (callback) { return callback() }
    }
    if (this.ipfs) {
      this.ipfs.stop(() => {
        setImmediate(() => {
          callback()
        })
      })
    }
  }
}
