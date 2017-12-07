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
