# Paratii IPFS API

## `paratii.ipfs`

Contains functions to interact with the IPFS instance.


    import { ParatiiIPFS } from 'ipfs-lib'
    paratiiIPFS = new ParatiiIPFS({})


It is also available as `ipfs` in `Paratii` instances:

    import { Paratii } from 'ipfs-lib'

- TBD: https://github.com/Paratii-Video/paratii-lib/issues/18

## configuration

Here is an example with default options:

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


## `ipfs.start()`

Starts the IPFS node

    ipfs.start()


- TBD:  https://github.com/Paratii-Video/paratii-lib/issues/19

## `ipfs.stop()`

Stops the IPFS node.

    ipfs.stop()

- TBD:  https://github.com/Paratii-Video/paratii-lib/issues/19

## `ipfs.get(ipfsHash, options)`

Returns a promise that resolves into a file stream.

- TBD: Define what the `options` are, here, if any (presumably, some callbacks)
- TBD:  https://github.com/Paratii-Video/paratii-lib/issues/20


# `ipfs.uploader`

## `ipfs.uploader.upload(file, options)`

This will just upload the file _as is_ to your local IPFS node.

    ipfs.upload(file, {
      onStart: Function, // function()
      onFileReady: Function, // function(file)
      onProgress: Function, // function(chunkLength)
      onDone: Function // function(file)
    })

- TBD:

## `ipfs.uploader.transcode(fileHash, options)`


Send transcode signal:

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

- TBD:

## Upload and transcode


    ipfs.upload(file, {
      onDone: function(file) {
        this.transcode(file.hash, {author: this.id.id})
      }
    })

TBD: decide if we want an `uploadAndTrancode(..)` helper funtion in our API.

#### `ipfs.uploader.grabYt(url, options)


    ipfs.uploader.grabYT(url, {
      onResponse: function(err, starttime) { },
      onDone: function(err, result) { }
    })


Grabs a Youtube video and adds it to IPFS.

- TBD: make it return a promise



`onResponse` is an initial callback when Youtube first responds with the requested
video. params are `onResponse(err, starttime)`

`onDone` is the final callback, triggered when the original file is added to IPFS.


#### `ipfs.uploader.grabVimeo(url, options)


    ipfs.uploader.grabVimeo(url, {
      onResponse: function(err, starttime) { },
      onDone: function(err, result) { }
    })


Grabs a Vimeo video and adds it to IPFS.

- TBD: make it return a promise

## `ipfs.metrics`

The `metrics` object keeps in-memory statistics.

    $ ipfs.metrics['ipfsHash']
    {
      hash: currentVideo.src,
      totalBytes: 0,
      received: 0,
      elapsed: null,
      started: null,
      finished: null,
      dupRatio: 0,
      queue: [],
      chunks: [],
      rates: {
        min: 0,
        max: 0,
        avg: 0,
        median: 0
      },
      overallRate: 0
    }

- TBD: still has to be implemented/migrated    
