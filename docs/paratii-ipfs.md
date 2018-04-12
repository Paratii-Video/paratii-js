# Paratii IPFS API

## `paratii.ipfs`

Contains functions to interact with the IPFS instance.


    import { ParatiiIPFS } from 'paratii-lib'
    paratiiIPFS = new ParatiiIPFS({})


It is also available as `ipfs` in `Paratii` instances:

    import Paratii from 'paratii-lib'
    paratii = new Paratii()
    paratii.ipfs // is a ParatiiIPFS instance


## configuration

Here is an example with default options:

    paratiiIPFS = new ParatiiIPFS({
      protocol: null,
      onReadyHook: [],
      'ipfs.config.addresses.swarm': [
        '/dns4/star.paratii.video/wss/p2p-webrtc-star'
      ],
      'ipfs.config.Bootstrap': [
        '/dns4/bootstrap.paratii.video/tcp/443/wss/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW'
      ],
      'ipfs.repo': 'path/to/repo', // this identifies the repository
      'ipfs.bitswap.maxMessageSize': 32 * 1024,
      'address': '0x12345',  // 'Ethereum acccounts'
      'verbose': false
    })


## `ipfs.start()`

Starts the IPFS node

    ipfs.start()


## `ipfs.stop()`

Stops the IPFS node.

    ipfs.stop()


## `ipfs.clearRepo()`


returns:  a Promise

[the current code does not particularly 'clear': it instead sets the repo to a new value, and restarts ipfs]

## `ipfs.isOnline()`


returns: a boolean


## `ipfs.get(ipfsHash)`

Returns a promise that resolves into a file stream.

## `ipfs.add(file)`

Add the file. For more control over event handling and such, cf. `ipfs.uploader.add(file)`

    $ ipfs.add(fileStream)
    // { path: 'QmS8yinWCD1vm7WJx34tg81FpjEXbdYXf3Y5XcCeh29C6K',
    //   hash: 'QmS8yinWCD1vm7WJx34tg81FpjEXbdYXf3Y5XcCeh29C6K',
    //   size: 26 } ]

## `ipfs.getIPFSInstance()` instance

Instantiate an IPFS istance of `jsipfs`. This API is documented here:

https://github.com/ipfs/js-ipfs-api#api

## `ipfs.addJSON(data)`

adds a `data` Object to the IPFS local instance.

**return** a `Promise` with the IPFS `multihash`

## `ipfs.getJSON(multihash)`

gets a JSON object stored in IPFS.

**returns** a `Promise` of requested Object.

# `ipfs.uploader`

## `ipfs.uploader.add(file, options)`

This will just upload the file _as is_ to your local IPFS node.

**Note: signature has changed - add now returns an event emitter**

    ipfs.add(file, {
      onStart: Function, // function()
      onFileReady: Function, // function(file)
      onProgress: Function, // function(chunkLength)
      onDone: Function // function(file)
    })

It can also handle uploads of lists of files:

    ipfs.add([file1, file2], {
      onStart: Function, // function()
      onFileReady: Function, // function(file)
      onProgress: Function, // function(chunkLength)
      onDone: Function // function(file)
    })


## `ipfs.uploader.transcode(fileHash, options)`


Send transcode signal:

    transcode('hash-of-file')

    transcode ('hash-of-file', {
        author: String,
      })

Returns an EventEmitter with the following events:


##  `ipfs.uploader.addAndTrancode`


The function `addAndTranscode` is an abbreviation for the following pattern:

    ipfs.upload(file, {
      onDone: function(file) {
        this.transcode(file.hash, {author: this.id.id})
      }
    })

## `ipfs.uploader.pinFile(multihash)`

Sends out a `pin` order to the paratii network in order to persist the Data
added to the local IPFS node.

**returns** `EventEmitter` instance with `pin:done` and `pin:error` events.

**Example**

```javascript
it('should be able to pin a JSON Object', (done) => {
  paratiiIPFS.addJSON({test: 1}).then((multihash) => {
    assert.isOk(multihash)
    let ev = paratiiIPFS.uploader.pinFile(multihash)
    ev.once('pin:error', done)
    ev.once('pin:done', (hash) => {
      expect(hash).to.equal(multihash)
      done()
    })
  }).catch((err) => {
    done(err)
  })
})
```

#### `ipfs.uploader.grabYT(url, options)`


    ipfs.uploader.grabYT(url, {
      onResponse: function(err, starttime) { },
      onDone: function(err, result) { }
    })


Grabs a Youtube video and adds it to IPFS.

`onResponse` is an initial callback when Youtube first responds with the requested
video. params are `onResponse(err, starttime)`

`onDone` is the final callback, triggered when the original file is added to IPFS.


#### `ipfs.uploader.grabVimeo(url, options)`


    ipfs.uploader.grabVimeo(url, {
      onResponse: function(err, starttime) { },
      onDone: function(err, result) { }
    })


Grabs a Vimeo video and adds it to IPFS.


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
