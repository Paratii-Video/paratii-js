# Paratii IPFS API

## `paratii.ipfs`

Contains functions to interact with the IPFS instance

It can also be instantiated directly:

    import { paratiiIPFS } from '../path/to/paratii.ipfs.js'
    paratiiIPFS = new ParatiiIPFS({
        opt1: val1, opt2: val2, ...
    })

## configuration

Here is an example of all default options:

    paratiiIPFS = new ParatiiIPFS({
      protocol: null,
      onReadyHook: [],
      'config.addresses.swarm': [
        '/dns4/star.paratii.video/wss/p2p-webrtc-star'
      ],
      'config.Bootstrap': [
        '/dns4/bootstrap.paratii.video/tcp/443/wss/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW'
      ],
      'repo': 'path/to/repo', // this identifies the repository
      'repo': '/tmp/paratii-alpha-' + String(Math.random()), // key where to save information
      'bitswap.maxMessageSize': 32 * 1024,
      'address': '0x12345',  // 'Ethereum acccounts'
      'verbose': false
    })


## `ipfs.upload`

    ipfs.upload(file, {
      onStart: Function, // function()
      onFileReady: Function, // function(file)
      onProgress: Function, // function(chunkLength)
      onDone: Function // function(file)
    })

## `ipfs.transcode`


Set transcode signal

    transcode('hash-of-file')

    transcode ('hash-of-file', {
        author: String,
        onError: function (err) {
          if (err) this.warn('[Paratii-protocol] Error ', err)
        },
        onDone: function (err, result) {
          if (err) this.warn('[Paratii-protocol] Error ', err)
        }
      })

## Upload and transcode

    ipfs.upload(file, {
      onDone: function(file) {
        this.transcode(file.hash, {author: this.id.id})
      }
    })
