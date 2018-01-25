// import { paratiiIPFS } from './ipfs/index.js'
import Protocol from 'paratii-protocol'
global.Buffer = global.Buffer || require('buffer').Buffer

const Ipfs = require('ipfs')
const dopts = require('default-options')
const Uploader = require('./paratii.ipfs.uploader.js')
// var pull = require('pull-stream')
// var pullFilereader = require('pull-filereader')

export class ParatiiIPFS {
  constructor (config) {
    let defaults = {
      protocol: null,
      onReadyHook: [],
      'config.addresses.swarm': [
        '/dns4/star.paratii.video/tcp/443/wss/p2p-webrtc-star'
      ],
      'ipfs.config.Bootstrap': [
        '/dns4/bootstrap.paratii.video/tcp/443/wss/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW'
      ],
      'ipfs.repo': '/tmp/paratii-alpha-' + String(Math.random()), // key where to save information
      'ipfs.bitswap.maxMessageSize': 32 * 1024,
      'address': null,  // 'Ethereum address'
      'verbose': false
    }
    this.config = dopts(config, defaults, {allowUnknown: true})

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
        let ipfs = new Ipfs({
          bitswap: {
            maxMessageSize: config['ipfs.bitswap.maxMessageSize']
          },
          repo: config['repo'] || '/tmp/test-repo-' + String(Math.random()),
          config: {
            Addresses: {
              Swarm: config['ipfs.config.addresses.swarm']
            },
            Bootstrap: config['ipfs.config.Bootstrap']
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
              chunkSize: 64048
            })

            this.protocol.notifications.on('message:new', (peerId, msg) => {
              this.log('[paratii-protocol] ', peerId.toB58String(), ' new Msg: ', msg)
            })

            this.ipfs = ipfs

            resolve(ipfs)
          })
        })

        ipfs.on('error', (err) => {
          if (err) {
            // this.log('IPFS node ', ipfs)
            this.error('[IPFS] Error ', err)
            reject(err)
          }
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
      node = await ipfs.object.put(obj)
    } catch (e) {
      if (e) throw e
    }

    return node.toJSON().multihash
  }

  async getJSON (multihash) {
    let ipfs = await this.getIPFSInstance()
    // if (!this.ipfs || !this.ipfs.isOnline()) {
    //   throw new Error('IPFS node is not ready, please trigger getIPFSInstance first')
    // }

    let node
    try {
      node = await ipfs.object.get(multihash)
    } catch (e) {
      if (e) throw e
    }

    return JSON.parse(node.toJSON().data)
  }

  // TODO: return a promise
  start (callback) {
    // if (!window.Ipfs) {
    //   return callback(new Error('window.Ipfs is not available, call initIPFS first'))
    // }

    if (this.ipfs && this.ipfs.isOnline()) {
      return callback()
    }

    this.getIPFSInstance().then(function (ipfs) { ipfs.start(callback) })
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
