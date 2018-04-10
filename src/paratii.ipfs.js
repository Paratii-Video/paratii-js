import Protocol from 'paratii-protocol'
import { ipfsSchema, accountSchema } from './schemas.js'
import joi from 'joi'
import { EventEmitter } from 'events'
import { ParatiiIPFSUploader } from './paratii.ipfs.uploader.js'
global.Buffer = global.Buffer || require('buffer').Buffer

/**
 * Contains functions to interact with the IPFS instance.
 * @param {ParatiiIPFSSchema} config configuration object to initialize Paratii object
 * @property {Uploader} uploader Paratii IPFS uploader interface
 */
export class ParatiiIPFS extends EventEmitter {
  /**
  * @typedef {Array} ParatiiIPFSSchema
  * @property {?ipfsSchema} ipfs
  * @property {?accountSchema} account
  * @property {?boolean} verbose
 */
  constructor (config) {
    super()
    const schema = joi.object({
      ipfs: ipfsSchema,
      account: accountSchema,
      verbose: joi.bool().default(false)
    })

    const result = joi.validate(config, schema, {allowUnknown: true})
    if (result.error) throw result.error
    this.config = config
    this.config.ipfs = result.value.ipfs
    this.config.account = result.value.account
    this.uploader = new ParatiiIPFSUploader({ipfs: this.config.ipfs, paratiiIPFS: this})
  }
  // /**
  //  * Adds the file to ipfs
  //  * @param  {ReadStream}  fileStream ReadStream of the file. Can be created with fs.createReadStream(path)
  //  * @return {Promise}            data about the added file (path,multihash,size)
  //
  //  */
  // async add (fileStream) {
  //   let ipfs = await this.getIPFSInstance()
  //   return ipfs.files.add(fileStream)
  // }

  /**
   * uploads a single file or an array of files to *local* IPFS node
   * @param {File} file HTML5 File Object.
   * @returns {EventEmitter} checkout the upload function below for details.
   * @example
   * let path = 'test/data/some-file.txt'
   * let fileStream = fs.createReadStream(path)
   * let result = await paratiiIPFS.add(fileStream)
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
    return this.uploader.upload(result)
  }

  /**
   * get file from ipfs
   * @param  {string}  hash ipfs multihash of the file
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

              this.uploader._node = ipfs

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
   * add a JSON to local IPFS instance, sends a message to paratii.config.ipfs.remoteIPFSNode to pin the mesage
   * @param  {object}  data JSON object to store
   * @return {Promise} resolves in the hash of the added file, after confirmation from the remove node
   * @example let hash = await paratii.ipfs.addAndPinJSON(data)
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
        this.log('pin:done:', hash)
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
  }
