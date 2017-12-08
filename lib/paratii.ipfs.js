// import { paratiiIPFS } from './ipfs/index.js'
import Protocol from 'paratii-protocol'

const Ipfs = require('ipfs')
const dopts = require('default-options')
const Uploader = require('./ipfs/uploader')

export class ParatiiIPFS {
  constructor (config) {
    this.config = config

    let defaults = {
      protocol: null,
      onReadyHook: [],
      'config.addresses.swarm': [
        '/dns4/star.paratii.video/wss/p2p-webrtc-star'
      ],
      'config.Bootstrap': [
        '/dns4/bootstrap.paratii.video/tcp/443/wss/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW'
      ],
      'repo': '/tmp/paratii-alpha-' + String(Math.random()), // key where to save information
      'bitswap.maxMessageSize': 32 * 1024,
      'account': null  // 'Ethereum acccounts'

    }
    let options = dopts(config, defaults, {allowUnknown: true})
    Object.assign(this.config, options)
  }

  getIPFSInstance () {
    return new Promise((resolve, reject) => {
      if (this.ipfs) {
        resolve(this.ipfs)
      } else {
        let config = this.config
        this.ipfs = new Ipfs({
          bitswap: {
            maxMessageSize: config['bitswap.maxMessageSize']
          },
          repo: config.repo,
          config: {
            Addresses: {
              Swarm: config['config.addresses.swarm']
            },
            Bootstrap: config['config.Bootstrap']
          }
        })

        let ipfs = this.ipfs

        ipfs.on('ready', () => {
          console.log('[IPFS] node Ready.')

          ipfs._bitswap.notifications.on('receivedNewBlock', (peerId, block) => {
            console.log('[IPFS] receivedNewBlock | peer: ', peerId.toB58String(), ' block length: ', block.data.length)
            console.log('---------[IPFS] bitswap LedgerMap ---------------------')
            ipfs._bitswap.engine.ledgerMap.forEach((ledger, peerId, ledgerMap) => {
              console.log(`${peerId} : ${JSON.stringify(ledger.accounting)}\n`)
            })
            console.log('-------------------------------------------------------')
          })

          ipfs.id().then((id) => {
            let peerInfo = id
            this.id = id
            console.log('[IPFS] id: ', peerInfo)
            let ptiAddress = this.config.account || 'no_address'
            this.protocol = new Protocol(
              ipfs._libp2pNode,
              ipfs._repo.blocks,
              // add ETH Address here.
              ptiAddress
            )

            // uploader
            this.uploader = new Uploader(this, {
              node: ipfs,
              chunkSize: 64048
            })

            this.protocol.notifications.on('message:new', (peerId, msg) => {
              console.log('[paratii-protocol] ', peerId.toB58String(), ' new Msg: ', msg)
            })

            // setTimeout(() => {
            //   this.protocol.start(noop)
            //   this.triggerOnReady()
            // }, 10)

            this.ipfs = ipfs

            resolve(ipfs)

            // setImmediate(() => {
            //
            // })
            // callback()
          })
          // resolve(ipfs)
        })

        ipfs.on('error', (err) => {
          if (err) {
            console.log('IPFS node ', ipfs)
            console.error('[IPFS] ', err)
            reject(err)
          }
        })
      }
    })
  }

  // TODO: return a promise
  start (callback) {
    // if (!window.Ipfs) {
    //   return callback(new Error('window.Ipfs is not available, call initIPFS first'))
    // }

    if (this.ipfs && this.ipfs.isOnline()) {
      return callback()
    }

    this.ipfs.start(callback)
  }

  stop (callback) {
    if (!this.ipfs || !this.ipfs.isOnline()) {
      if (callback) { return callback() }
    }
    if (this.ipfs) {
      return this.ipfs.stop(callback)
    }
  }
}
