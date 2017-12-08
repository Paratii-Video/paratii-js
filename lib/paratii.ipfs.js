// import { paratiiIPFS } from './ipfs/index.js'
import Protocol from 'paratii-protocol'
const pull = require('pull-stream')
const pullFilereader = require('pull-filereader')

const Ipfs = require('ipfs')
const dopts = require('default-options')

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

            this.protocol.notifications.on('message:new', (peerId, msg) => {
              console.log('[paratii-protocol] ', peerId.toB58String(), ' new Msg: ', msg)
            })

            // setTimeout(() => {
            //   this.protocol.start(noop)
            //   this.triggerOnReady()
            // }, 10)

            this.ipfs = ipfs
            resolve(ipfs)
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

  async uploadFiles (files) {
    var fileSize = 0
    await this.getIPFSInstance()
    var total = 0
    function updateProgress (chunkLength) {
      total += chunkLength
      console.log('Progress \t', total, ' / ', fileSize, ' = ', Math.floor((total / fileSize) * 100))
    }
    this.start(() => {
      // replace this by a callback?
      // setInterval(() => {
      //   this.ipfs._bitswap.engine.ledgerMap.forEach((ledger, peerId, ledgerMap) => {
      //     console.log(`${peerId} : ${JSON.stringify(ledger.accounting)}\n`)
      //   })
      // }, 5000)

      pull(
        pull.values(files),
        pull.through((file) => {
          console.log('Adding ', file)
          fileSize = file.size
          total = 0
        }),
        pull.asyncMap((file, cb) => pull(
          pull.values([{
            path: file.name,
            // content: pullFilereader(file)
            content: pull(
              pullFilereader(file),
              pull.through((chunk) => updateProgress(chunk.length))
            )
          }]),
          this.ipfs.files.createAddPullStream({chunkerOptions: {maxChunkSize: 64048}}), // default size 262144
          pull.collect((err, res) => {
            if (err) {
              return cb(err)
            }
            const file = res[0]
            console.log('Adding %s finished', file.path)

            // statusEl.innerHTML += `Added ${file.path} as ${file.hash} ` + '<br>'
            // Trigger paratii transcoder signal

            let msg = this.protocol.createCommand('transcode', {hash: file.hash, author: this.id.id})
            this.ipfs.swarm.connect('/dns4/bootstrap.paratii.video/tcp/443/wss/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW', (err, success) => {
              if (err) throw err
              this.ipfs.swarm.peers((err, peers) => {
                console.log('peers: ', peers)
                if (err) throw err
                peers.map((peer) => {
                  console.log('sending transcode msg to ', peer.peer.id.toB58String())
                  this.protocol.network.sendMessage(peer.peer.id, msg, (err) => {
                    if (err) console.warn('[Paratii-protocol] Error ', err)
                  })

                  if (peer.addr) {
                  }
                })
                cb(null, file)
              })
            })
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

      // paratii transcoder signal.
      this.protocol.notifications.on('command', (peerId, command) => {
        console.log('paratii protocol: Got Command ', command)
        if (command.payload.toString() === 'transcoding:done') {
          let args = JSON.parse(command.args.toString())
          let result = JSON.parse(args.result)
          console.log('args: ', args)
          console.log('result: ', result)
          // statusEl.innerHTML += `Video HLS link: /ipfs/${result.master.hash}\n`

          // titleEl = document.querySelector('#input-title')
          // console.log('titleEl: ', titleEl)
        //   Meteor.call('videos.create', {
        //     id: String(Math.random()).split('.')[1],
        //     title: titleEl.value,
        //     price: 0.0,
        //     src: '/ipfs/' + result.master.hash,
        //     mimetype: 'video/mp4',
        //     stats: {
        //       likes: 0,
        //       dislikes: 0
        //     }}, (err, videoId) => {
        //       if (err) throw err
        //       console.log('[upload] Video Uploaded: ', videoId)
        //       statusEl.innerHTML += '\n Video Uploaded go to <b><a href="/play/' + videoId + '">/play/' + videoId + '</a></b>\n'
        //     })
        }
      })
    })
  }
}
