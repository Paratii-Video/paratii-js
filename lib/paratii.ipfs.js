import Protocol from 'paratii-protocol'
import { ipfsSchema, accountSchema } from './schemas.js'
import joi from 'joi'
import { EventEmitter } from 'events'

global.Buffer = global.Buffer || require('buffer').Buffer

const Uploader = require('./paratii.ipfs.uploader.js')

export class ParatiiIPFS extends EventEmitter {
  constructor (config) {
    super()
    const schema = joi.object({
      ipfs: ipfsSchema,
      account: accountSchema
    })
    //   protocol: joi.string().default(null),
    //   onReadyHook: joi.array().ordered().default([]),
    //   'config.addresses.swarm': joi
    //     .array()
    //     .ordered(
    //         joi.string().default('/dns4/star.paratii.video/tcp/443/wss/p2p-webrtc-star'),
    //         joi.string().default('/dns/ws.star.paratii.video/wss/p2p-websocket-star/')
    //     ),
    //   'ipfs.config.Bootstrap': joi
    //   .array()
    //   .ordered(
    //       joi.string().default('/dns4/bootstrap.paratii.video/tcp/443/wss/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW')
    //   ),
    //   'ipfs.bitswap.maxMessageSize': joi.number().default(128 * 1024),
    //   address: joi.string().default(null),
    //   verbose: joi.bool().default(false)
    // }).unknown()

    const result = joi.validate(config, schema, {allowUnknown: true})
    if (result.error) throw result.error
    config.ipfs = result.value.ipfs
    this.config = config
    this.uploader = new Uploader(this)
  }

  async add (fileStream) {
    let ipfs = await this.getIPFSInstance()
    return ipfs.files.add(fileStream)
  }

  async get (hash) {
    let ipfs = await this.getIPFSInstance()
    return ipfs.files.get(hash)
  }

  log (...msg) {
    if (this.config.verbose) {
      console.log(...msg)
    }
  }
  warn (...msg) {
    if (this.config.verbose) {
      console.warn(...msg)
    }
  }

  error (...msg) {
    if (this.config.verbose) {
      console.error(...msg)
    }
  }

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
              maxMessageSize: this.config['bitswap.maxMessageSize']
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
