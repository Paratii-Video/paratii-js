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
      'config.addresses.swarm': [],
      'config.Bootstrap': [],
      'repo': 'paratii-alpha-' + String(math.random()),
      'bitswap.maxMessageSize': 32 * 1024,
    })

## API

### `paratii.ipfs.uploader`

#### `grabYt(url, [onResponse], [callback])`

Grabs a Youtube video and adds it to IPFS.

`onResponse` is an initial callback when Youtube first responds with the requested
video. params are `onResponse(err, starttime)`

`callback` is the final callback, triggered when the original file is added to IPFS.


#### `grabVimeo(url, [onResponse], [callback])`

Grabs a Vimeo video and adds it to IPFS.
