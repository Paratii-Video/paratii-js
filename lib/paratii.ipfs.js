// import { paratiiIPFS } from './ipfs/index.js'
import Protocol from 'paratii-protocol'

const Ipfs = require('ipfs')
const dopts = require('default-options')
const Uploader = require('./paratii.ipfs.uploader.js')
var pull = require('pull-stream')
var pullFilereader = require('pull-filereader')

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
      'address': null,  // 'Ethereum address'
      'verbose': false
    }
    let options = dopts(config, defaults, {allowUnknown: true})
    Object.assign(this.config, options)
  }

  log (msg) {
    if (this.config.verbose) {
      console.log(msg)
    }
  }
  warn (msg) {
    if (this.config.verbose) {
      console.warn(msg)
    }
  }

  error (msg) {
    if (this.config.verbose) {
      console.error(msg)
    }
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
            this.log('[IPFS] id: ', peerInfo)
            let ptiAddress = this.config.address || 'no_address'
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
              this.log('[paratii-protocol] ', peerId.toB58String(), ' new Msg: ', msg)
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
            this.log('IPFS node ', ipfs)
            this.error('[IPFS] ', err)
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

  async uploadFiles (files, options) {
    // TODO return proper promsie with status updates
    let _this = this
    let defaults = {
      onStart: function () {
        _this.log('Upload started')
        // setInterval(() => {
        //   this.ipfs._bitswap.engine.ledgerMap.forEach((ledger, peerId, ledgerMap) => {
        //     this.log(`${peerId} : ${JSON.stringify(ledger.accounting)}\n`)
        //   })
        // }, 5000)
      },
      onProgress: function (chunkLength) {
        total += chunkLength
        this.log('Progress \t', total, ' / ', fileSize, ' = ', Math.floor((total / fileSize) * 100))
      },
      onDone: function (file) {
        this.log('Adding %s finished', file.path)
        // statusEl.innerHTML += `Added ${file.path} as ${file.hash} ` + '<br>'
        // Trigger paratii transcoder signal
        this.transcode({hash: file.hash, author: this.id.id})
      },
      onFileReady: Function // function(file)
    }
    options = dopts(options, defaults)

    var fileSize = 0
    await this.getIPFSInstance()
    var total = 0
    this.start(() => {
      // set this by passing onSTart
      options.onStart()

      pull(
        pull.values(files),
        pull.through((file) => {
          this.log('Adding ', file)
          fileSize = file.size
          total = 0
        }),
        pull.asyncMap((file, cb) => pull(
          pull.values([{
            path: file.name,
            // content: pullFilereader(file)
            content: pull(
              pullFilereader(file),
              pull.through((chunk) => options.onProgress(chunk.length))
            )
          }]),
          this.ipfs.files.createAddPullStream({chunkerOptions: {maxChunkSize: 64048}}), // default size 262144
          pull.collect((err, res) => {
            if (err) {
              return cb(err)
            }
            const file = res[0]
            options.onDone(file)
          }))),
        pull.collect((err, files) => {
          if (err) {
            throw err
          }
          // if (files && files.length) {
          //   statusEl.innerHTML += `All Done!\n`
          //   statusEl.innerHTML += `Don't Close this window. signaling transcoder...\n`
          // }
        })
      )
    })
  }

  // async transcode (options) {
  //   // TODO: return a promise
  //   // sends a message to the transcoding server to start transcoding the file with the given hash
  //   let defaults = {
  //     hash: String,
  //     author: String,
  //     onError: function (err) {
  //       if (err) this.warn('[Paratii-protocol] Error ', err)
  //     },
  //     onDone: function (args, result) {
  //       //
  //       this.log('args: ', args)
  //       this.log('result: ', result)
  //       // statusEl.innerHTML += `Video HLS link: /ipfs/${result.master.hash}\n`
  //       // titleEl = document.querySelector('#input-title')
  //       // this.log('titleEl: ', titleEl)
  //     //   Meteor.call('videos.create', {
  //     //     id: String(Math.random()).split('.')[1],
  //     //     title: titleEl.value,
  //     //     price: 0.0,
  //     //     src: '/ipfs/' + result.master.hash,
  //     //     mimetype: 'video/mp4',
  //     //     stats: {
  //     //       likes: 0,
  //     //       dislikes: 0
  //     //     }}, (err, videoId) => {
  //     //       if (err) throw err
  //     //       this.log('[upload] Video Uploaded: ', videoId)
  //     //       statusEl.innerHTML += '\n Video Uploaded go to <b><a href="/play/' + videoId + '">/play/' + videoId + '</a></b>\n'
  //     //     })
  //     }
  //   }
  //   options = dopts(options, defaults)
  //   let msg = this.protocol.createCommand('transcode', {hash: options.hash, author: options.author})
  //   this.ipfs.swarm.connect('/dns4/bootstrap.paratii.video/tcp/443/wss/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW', (err, success) => {
  //     if (err) throw err
  //     this.ipfs.swarm.peers((err, peers) => {
  //       this.log('peers: ', peers)
  //       if (err) throw err
  //       peers.map((peer) => {
  //         this.log('sending transcode msg to ', peer.peer.id.toB58String())
  //         this.protocol.network.sendMessage(peer.peer.id, msg, options.onError)
  //         if (peer.addr) {
  //         }
  //       })
  //     })
  //   })
  //
  //   // wait for paratii transcoder signal.
  //   this.protocol.notifications.on('command', (peerId, command) => {
  //     this.log('paratii protocol: Got Command ', command)
  //     if (command.payload.toString() === 'transcoding:done') {
  //       let args = JSON.parse(command.args.toString())
  //       let result = JSON.parse(args.result)
  //       options.onDone(args, result)
  //     }
  //   })
  // }
}
